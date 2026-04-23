import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIndentDto } from './dto/create-indent.dto';
import { UpdateIndentDto } from './dto/update-indent.dto';

@Injectable()
export class IndentService {
  constructor(private prisma: PrismaService) {}

  private generateIndentNumber(): string {
    return `IND-${Date.now()}`;
  }

  async create(dto: CreateIndentDto, userId: string) {
    return this.prisma.indent.create({
      data: {
        indent_number: this.generateIndentNumber(),
        company_id: dto.company_id,
        created_by_user_id: userId,
        remarks: dto.remarks,
        items: {
          create: dto.items.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            remarks: item.remarks,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(company_id?: string, status?: string, page = 1, limit = 10) {
    const where: any = {};
    if (company_id) where.company_id = company_id;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.indent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: { items: { include: { item: true } } },
      }),
      this.prisma.indent.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const indent = await this.prisma.indent.findUnique({
      where: { id },
      include: { items: { include: { item: true } } },
    });

    if (!indent) throw new NotFoundException('Indent not found');
    return indent;
  }

  async update(id: string, dto: UpdateIndentDto) {
    const indent = await this.prisma.indent.findUnique({ where: { id } });
    if (!indent) throw new NotFoundException('Indent not found');
    if (indent.status !== 'DRAFT') throw new ForbiddenException('Only DRAFT indents can be updated');

    if (dto.items) {
      await this.prisma.indentItem.deleteMany({ where: { indent_id: id } });
    }

    return this.prisma.indent.update({
      where: { id },
      data: {
        ...(dto.remarks && { remarks: dto.remarks }),
        ...(dto.items && {
          items: {
            create: dto.items.map((item) => ({
              item_id: item.item_id!,
              quantity: item.quantity!,
              remarks: item.remarks,
            })),
          },
        }),
      },
      include: { items: true },
    });
  }

  async submit(id: string) {
    const indent = await this.prisma.indent.findUnique({ where: { id } });
    if (!indent) throw new NotFoundException('Indent not found');
    if (indent.status !== 'DRAFT') throw new BadRequestException('Only DRAFT indents can be submitted');

    return this.prisma.indent.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });
  }

  async approve(id: string) {
    const indent = await this.prisma.indent.findUnique({ where: { id } });
    if (!indent) throw new NotFoundException('Indent not found');
    if (indent.status !== 'SUBMITTED') throw new BadRequestException('Only SUBMITTED indents can be approved');

    return this.prisma.indent.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async reject(id: string, remarks: string) {
    const indent = await this.prisma.indent.findUnique({ where: { id } });
    if (!indent) throw new NotFoundException('Indent not found');
    if (indent.status !== 'SUBMITTED') throw new BadRequestException('Only SUBMITTED indents can be rejected');

    return this.prisma.indent.update({
      where: { id },
      data: { status: 'REJECTED', remarks },
    });
  }
}