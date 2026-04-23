import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { RFQService } from './rfq.service';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('RFQ')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Permission('rfq', 'create')
  @Post()
  create(@Body() dto: CreateRFQDto, @CurrentUser() user: any) {
    return this.rfqService.create(dto, user.id);
  }

  @Permission('rfq', 'read')
  @Get()
  @ApiQuery({ name: 'company_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('company_id') company_id?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.rfqService.findAll(company_id, status, Number(page) || 1, Number(limit) || 10);
  }

  @Permission('rfq', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rfqService.findOne(id);
  }

  @Permission('rfq', 'update')
  @Patch(':id/attach-vendors')
  attachVendors(@Param('id') id: string, @Body('vendor_ids') vendor_ids: string[]) {
    return this.rfqService.attachVendors(id, vendor_ids);
  }

  @Permission('rfq', 'update')
  @Patch(':id/send')
  send(@Param('id') id: string) {
    return this.rfqService.send(id);
  }

  @Permission('rfq', 'update')
  @Patch(':id/close')
  close(@Param('id') id: string) {
    return this.rfqService.close(id);
  }

  @Permission('rfq', 'create')
  @Post(':id/quote')
  submitQuote(@Param('id') id: string, @Body() dto: CreateQuoteDto) {
    return this.rfqService.submitQuote(id, dto);
  }
}