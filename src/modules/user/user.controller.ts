import { Controller, Get, Post, Param, Body, Patch, UseGuards, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('create-admin')
  @ApiHeader({ name: 'x-admin-secret', description: 'Secret key to create admin user' })
  createAdmin(
    @Body() dto: CreateUserDto,
    @Headers('x-admin-secret') secretKey: string,
  ) {
    return this.userService.createAdmin(dto, secretKey);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.userService.toggleActive(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/assign-role/:roleId')
  assignRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.userService.assignRole(id, roleId);
  }
}