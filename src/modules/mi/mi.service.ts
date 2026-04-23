import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMIDto } from './dto/create-mi.dto';

@Injectable()
export class MIService {
  constructor(private prisma: PrismaService) {}

  private generateMINumber(): string {
    return `MI-${Date.now()}`;
  }

  async create(dto: CreateMIDto, userId: string) {
    if (dto.indent_id) {
      const indent = await this.prisma.indent.findUnique({
        where: { id: dto.indent_id },
      });
      if (!indent) throw new NotFoundException('Indent not found');
      if (indent.status !== 'APPROVED') {
        throw new BadRequestException('Indent must be APPROVED to create MI');
      }
    }

    return this.prisma.mI.create({
      data: {
        mi_number: this.generateMINumber(),
        indent_id: dto.indent_id,
        issued_by_user_id: userId,
        items: {
          create: dto.items.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.mI.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          items: { include: { item: true } },
          indent: true,
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.mI.count(),
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
    const mi = await this.prisma.mI.findUnique({
      where: { id },
      include: {
        items: { include: { item: true } },
        indent: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!mi) throw new NotFoundException('MI not found');
    return mi;
  }

  async issue(id: string) {
    const mi = await this.prisma.mI.findUnique({ where: { id } });
    if (!mi) throw new NotFoundException('MI not found');
    if (mi.status !== 'DRAFT') throw new BadRequestException('Only DRAFT MI can be issued');

    return this.prisma.mI.update({
      where: { id },
      data: { status: 'ISSUED' },
    });
  }
}