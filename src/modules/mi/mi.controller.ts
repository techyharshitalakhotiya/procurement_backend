import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { MIService } from './mi.service';
import { CreateMIDto } from './dto/create-mi.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('MI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('mi')
export class MIController {
  constructor(private readonly miService: MIService) {}

  @Permission('mi', 'create')
  @Post()
  create(@Body() dto: CreateMIDto, @CurrentUser() user: any) {
    return this.miService.create(dto, user.id);
  }

  @Permission('mi', 'read')
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.miService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Permission('mi', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.miService.findOne(id);
  }

  @Permission('mi', 'update')
  @Patch(':id/issue')
  issue(@Param('id') id: string) {
    return this.miService.issue(id);
  }
}