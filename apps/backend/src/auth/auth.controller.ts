import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() body: any) {
    // Ideally use a DTO here
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    // A JWT has only the identity snapshot. The UI needs the current profile
    // after a refresh (including role and KYC changes made by staff).
    return this.usersService.findOne(req.user.id);
  }
}
