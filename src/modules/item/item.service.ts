import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async isItemLocked(itemId: string): Promise<boolean> {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        indent_items: true,
        mi_items: true,
        rfq_items: true,
      },
    });

    if (!item) return false;

    return (
      item.indent_items.length > 0 ||
      item.mi_items.length > 0 ||
      item.rfq_items.length > 0
    );
  }

  async create(dto: CreateItemDto, userId: string) {
    return this.prisma.item.create({
      data: {
        item_id: dto.item_id,
        company_id: dto.company_id,
        item_code: dto.item_code,
        name: dto.name,
        description: dto.description,
        unit: dto.unit,
        price: dto.price,
        created_by_user_id: userId,
        last_updated_by_user_id: userId,
      },
    });
  }

  async findAll(company_id?: string, name?: string, page = 1, limit = 10) {
    const where: any = { is_deleted: false };
    if (company_id) where.company_id = company_id;
    if (name) where.name = { contains: name, mode: 'insensitive' };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.item.count({ where }),
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
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item || item.is_deleted) throw new NotFoundException('Item not found');

    const locked = await this.isItemLocked(id);
    return { ...item, is_locked: locked };
  }

  async update(id: string, dto: UpdateItemDto, userId: string) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item || item.is_deleted) throw new NotFoundException('Item not found');

    const locked = await this.isItemLocked(id);
    if (locked) throw new ForbiddenException('Item is locked and cannot be edited');

    return this.prisma.item.update({
      where: { id },
      data: {
        ...dto,
        last_updated_by_user_id: userId,
      },
    });
  }

  async remove(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item || item.is_deleted) throw new NotFoundException('Item not found');

    return this.prisma.item.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}