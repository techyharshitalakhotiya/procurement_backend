import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { VendorLoginDto } from './dto/vendor-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VendorService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(dto: CreateVendorDto) {
    const existing = await this.prisma.vendor.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });

    if (existing) throw new BadRequestException('Email or phone already exists');

    const hashed = await bcrypt.hash(dto.password, 10);

    const vendor = await this.prisma.vendor.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        company_name: dto.company_name,
        password: hashed,
      },
    });

    const { password, ...result } = vendor;
    return result;
  }

  async login(dto: VendorLoginDto) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { email: dto.email },
    });

    if (!vendor) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, vendor.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: vendor.id,
      email: vendor.email,
      type: 'vendor',
    });

    return {
      access_token: token,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        company_name: vendor.company_name,
      },
    };
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.vendor.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          company_name: true,
          created_at: true,
          updated_at: true,
        },
      }),
      this.prisma.vendor.count(),
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
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        company_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    return this.prisma.vendor.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        company_name: true,
        created_at: true,
        updated_at: true,
      },
    });
  }
}