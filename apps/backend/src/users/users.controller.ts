import { Controller, Get, Patch, UseGuards, Request, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles, StaffRoles } from '../common/decorators/roles.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateKycDto } from './dto/update-kyc.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  async updateProfile(@Request() req, @Body() updateData: UpdateProfileDto) {
    const user = await this.usersService.update(req.user.id, updateData);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS)
  @Patch(':id/kyc')
  async updateKyc(@Param('id') id: string, @Body() body: UpdateKycDto) {
    const user = await this.usersService.updateKycStatus(id, body.status);
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(RolesGuard)
  @Roles(...StaffRoles)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(PlatformRole.ADMIN)
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    const user = await this.usersService.updateRole(id, role);
    const { password, ...result } = user;
    return result;
  }
}
