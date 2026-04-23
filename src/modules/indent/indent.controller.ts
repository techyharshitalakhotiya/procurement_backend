import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { IndentService } from './indent.service';
import { CreateIndentDto } from './dto/create-indent.dto';
import { UpdateIndentDto } from './dto/update-indent.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Indents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('indents')
export class IndentController {
  constructor(private readonly indentService: IndentService) {}

  @Permission('indent', 'create')
  @Post()
  create(@Body() dto: CreateIndentDto, @CurrentUser() user: any) {
    return this.indentService.create(dto, user.id);
  }

  @Permission('indent', 'read')
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
    return this.indentService.findAll(company_id, status, Number(page) || 1, Number(limit) || 10);
  }

  @Permission('indent', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indentService.findOne(id);
  }

  @Permission('indent', 'update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateIndentDto) {
    return this.indentService.update(id, dto);
  }

  @Permission('indent', 'update')
  @Patch(':id/submit')
  submit(@Param('id') id: string) {
    return this.indentService.submit(id);
  }

  @Permission('indent', 'update')
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.indentService.approve(id);
  }

  @Permission('indent', 'update')
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('remarks') remarks: string) {
    return this.indentService.reject(id, remarks);
  }
}