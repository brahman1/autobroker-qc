import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Keeps sign-in independent from the casing used in an email address. */
  normalizeEmail(email: string) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return null;

    // Accounts created before this correction remain accessible as well.
    return this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
  }

  async create(data: any) {
    return this.prisma.user.create({
      data: { ...data, email: this.normalizeEmail(data.email) },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; phone?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });
  }

  async updateKycStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { kycStatus: status },
    });
  }

  async updateRole(id: string, role: string) {
    const allowedRoles = ['ADMIN', 'OPERATIONS', 'FINANCE', 'SUPPORT', 'INSPECTOR', 'PARTNER', 'CLIENT'];
    if (!allowedRoles.includes(role)) throw new BadRequestException('Rôle invalide');
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return users.map(user => {
      const { password, ...result } = user;
      return result;
    });
  }
}
