import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Permission('item', 'create')
  @Post()
  create(@Body() dto: CreateItemDto, @CurrentUser() user: any) {
    return this.itemService.create(dto, user.id);
  }

  @Permission('item', 'read')
  @Get()
  @ApiQuery({ name: 'company_id', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('company_id') company_id?: string,
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.itemService.findAll(company_id, name, Number(page) || 1, Number(limit) || 10);
  }

  @Permission('item', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(id);
  }

  @Permission('item', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto, @CurrentUser() user: any) {
    return this.itemService.update(id, dto, user.id);
  }

  @Permission('item', 'delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}