import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email.trim().toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Courriel ou mot de passe incorrect');
    }
    
    const isMatch = await bcrypt.compare(pass, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Courriel ou mot de passe incorrect');
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      access_token: this.jwtService.sign(payload), // compatibilité
      user,
    };
  }

  async register(data: any) {
    const email = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
    if (!email) throw new BadRequestException('Adresse courriel invalide');
    if (typeof data.password !== 'string' || data.password.length < 8) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 8 caractères');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      ...data,
      email,
      password: hashedPassword,
      role: 'CLIENT',
      kycStatus: 'PENDING',
    });

    const { password, ...result } = user;
    return result;
  }
}
