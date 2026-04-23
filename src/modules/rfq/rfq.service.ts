import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';

const vendorSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  company_name: true,
  address: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class RFQService {
  constructor(private prisma: PrismaService) {}

  private generateRFQNumber(): string {
    return `RFQ-${Date.now()}`;
  }

  async create(dto: CreateRFQDto, userId: string) {
    return this.prisma.rFQ.create({
      data: {
        rfq_number: this.generateRFQNumber(),
        company_id: dto.company_id,
        created_by_user_id: userId,
        items: {
          create: dto.items.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
          })),
        },
        vendors: dto.vendor_ids
          ? {
              create: dto.vendor_ids.map((vendor_id) => ({ vendor_id })),
            }
          : undefined,
      },
      include: {
        items: { include: { item: true } },
        vendors: { include: { vendor: { select: vendorSelect } } },
      },
    });
  }

  async findAll(company_id?: string, status?: string, page = 1, limit = 10) {
    const where: any = {};
    if (company_id) where.company_id = company_id;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.rFQ.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          items: { include: { item: true } },
          vendors: { include: { vendor: { select: vendorSelect } } },
        },
      }),
      this.prisma.rFQ.count({ where }),
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
    const rfq = await this.prisma.rFQ.findUnique({
      where: { id },
      include: {
        items: { include: { item: true } },
        vendors: { include: { vendor: { select: vendorSelect } } },
        quotes: { include: { items: true, vendor: { select: vendorSelect } } },
      },
    });

    if (!rfq) throw new NotFoundException('RFQ not found');
    return rfq;
  }

  async attachVendors(id: string, vendor_ids: string[]) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) throw new NotFoundException('RFQ not found');

    const creates = vendor_ids.map((vendor_id) =>
      this.prisma.rFQVendor.upsert({
        where: { rfq_id_vendor_id: { rfq_id: id, vendor_id } },
        create: { rfq_id: id, vendor_id },
        update: {},
      }),
    );

    await Promise.all(creates);
    return this.findOne(id);
  }

  async send(id: string) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) throw new NotFoundException('RFQ not found');
    if (rfq.status !== 'DRAFT') throw new BadRequestException('Only DRAFT RFQ can be sent');

    return this.prisma.rFQ.update({
      where: { id },
      data: { status: 'SENT' },
    });
  }

  async close(id: string) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id } });
    if (!rfq) throw new NotFoundException('RFQ not found');
    if (rfq.status !== 'SENT') throw new BadRequestException('Only SENT RFQ can be closed');

    return this.prisma.rFQ.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async submitQuote(rfqId: string, dto: CreateQuoteDto) {
    const rfq = await this.prisma.rFQ.findUnique({ where: { id: rfqId } });
    if (!rfq) throw new NotFoundException('RFQ not found');
    if (rfq.status !== 'SENT') throw new BadRequestException('RFQ is not open for quotes');

    const vendorOnRFQ = await this.prisma.rFQVendor.findUnique({
      where: { rfq_id_vendor_id: { rfq_id: rfqId, vendor_id: dto.vendor_id } },
    });

    if (!vendorOnRFQ) throw new BadRequestException('Vendor is not attached to this RFQ');

    const existing = await this.prisma.quote.findUnique({
      where: { rfq_id_vendor_id: { rfq_id: rfqId, vendor_id: dto.vendor_id } },
    });

    if (existing) throw new BadRequestException('Quote already submitted');

    return this.prisma.quote.create({
      data: {
        rfq_id: rfqId,
        vendor_id: dto.vendor_id,
        items: {
          create: dto.items.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            per_unit_rate: item.per_unit_rate,
          })),
        },
      },
      include: { items: true },
    });
  }
}