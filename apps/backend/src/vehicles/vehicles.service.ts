import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any) {
    const where: Prisma.VehicleWhereInput = {};
    if (filters.make) where.make = { equals: filters.make, mode: 'insensitive' };
    if (filters.model) where.model = { equals: filters.model, mode: 'insensitive' };
    if (filters.saaqStatus) where.saaqStatus = filters.saaqStatus;
    if (filters.category) where.category = filters.category;
    if (filters.titleType) where.titleType = filters.titleType;
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.status === 'live') where.auctions = { some: { status: 'LIVE' } };
    if (filters.runAndDrive !== undefined) where.runAndDrive = filters.runAndDrive === 'true' || filters.runAndDrive === true;
    if (filters.hasKeys !== undefined) where.hasKeys = filters.hasKeys === 'true' || filters.hasKeys === true;
    if (filters.minYear || filters.maxYear) where.year = { gte: filters.minYear ? Number(filters.minYear) : undefined, lte: filters.maxYear ? Number(filters.maxYear) : undefined };
    if (filters.minPrice || filters.maxPrice) where.estimatedRetailValue = { gte: filters.minPrice ? Number(filters.minPrice) : undefined, lte: filters.maxPrice ? Number(filters.maxPrice) : undefined };
    if (filters.q) where.OR = ['make', 'model', 'vin', 'lotNumber', 'location'].map((field) => ({ [field]: { contains: filters.q, mode: 'insensitive' } }));
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 24));
    const [data, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({ where, include: { auctions: { where: { status: { in: ['LIVE', 'SCHEDULED'] } }, orderBy: { scheduledEndAt: 'asc' }, take: 1 } }, orderBy: filters.sort === 'price_asc' ? { estimatedRetailValue: 'asc' } : filters.sort === 'year_desc' ? { year: 'desc' } : { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.vehicle.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable');
    }
    return vehicle;
  }

  async purchaseEstimate(id: string, postalCode?: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { auctions: { where: { status: { in: ['LIVE', 'SCHEDULED'] } }, orderBy: { scheduledEndAt: 'asc' }, take: 1 } },
    });
    if (!vehicle) throw new NotFoundException('Véhicule introuvable');

    const auction = vehicle.auctions[0];
    const vehiclePrice = vehicle.buyNowPrice || auction?.currentBid || auction?.startingBid || vehicle.estimatedRetailValue;
    const buyerFee = Math.max(400, Math.round(vehiclePrice * 0.08));
    const subtotal = vehiclePrice + buyerFee;
    const taxes = Math.round(subtotal * 0.14975 * 100) / 100;
    const transport = postalCode ? (vehicle.location.toLowerCase().includes('québec') || vehicle.location.toLowerCase().includes('montreal') ? 450 : 850) : null;
    const repairEstimate = vehicle.saaqStatus === 'SCRAP' ? Math.round(vehicle.estimatedRetailValue * 0.65) : vehicle.saaqStatus === 'VGA' ? Math.round(vehicle.estimatedRetailValue * 0.22) : vehicle.primaryDamage.toLowerCase().includes('minor') ? 1200 : Math.round(vehicle.estimatedRetailValue * 0.1);
    const riskScore = Math.min(100, (vehicle.saaqStatus === 'SCRAP' ? 80 : vehicle.saaqStatus === 'VGA' ? 55 : 18) + (vehicle.runAndDrive ? 0 : 15) + (vehicle.hasKeys ? 0 : 12));
    return {
      vehiclePrice, buyerFee, taxes, transport, repairEstimate,
      totalBeforeRepair: subtotal + taxes + (transport || 0),
      totalWithRepair: subtotal + taxes + (transport || 0) + repairEstimate,
      riskScore,
      riskLevel: riskScore >= 65 ? 'ÉLEVÉ' : riskScore >= 35 ? 'MODÉRÉ' : 'FAIBLE',
      currency: 'CAD',
      assumptions: ['Estimation indicative — inspection et frais partenaire peuvent modifier le total.', 'Taxes calculées à titre indicatif pour le Québec (TPS + TVQ).'],
    };
  }

  async create(data: any) {
    return this.prisma.vehicle.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async importCsv(csv: string) {
    if (!csv?.trim()) throw new BadRequestException('Le contenu CSV est requis');
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new BadRequestException('Le CSV doit inclure une ligne d’en-têtes et au moins un véhicule');
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map((header) => header.trim().toLowerCase());
    const required = ['make', 'model', 'year', 'vin'];
    if (required.some((header) => !headers.includes(header))) throw new BadRequestException('Colonnes requises : make, model, year, vin');
    const result: { created: number; errors: { line: number; message: string }[] } = { created: 0, errors: [] };
    for (let index = 1; index < lines.length; index += 1) {
      const values = lines[index].split(delimiter).map((value) => value.trim());
      const row = Object.fromEntries(headers.map((header, column) => [header, values[column] || '']));
      try {
        if (!row.make || !row.model || !row.vin || !Number.isInteger(Number(row.year))) throw new Error('Données obligatoires invalides');
        await this.prisma.vehicle.create({ data: {
          make: row.make, model: row.model, year: Number(row.year), vin: row.vin.toUpperCase(),
          mileage: Number(row.mileage) || 0, saaqStatus: (row.saaqstatus || 'CLEAN').toUpperCase(),
          condition: (row.condition || 'UNKNOWN').toUpperCase(), fuelType: (row.fueltype || 'ESSENCE').toUpperCase(),
          primaryDamage: row.primarydamage || 'NON DÉCLARÉ', images: row.images ? row.images.split('|').filter(Boolean) : [],
          estimatedRetailValue: Number(row.estimatedretailvalue || row.value) || 0, location: row.location || 'Québec, Canada',
          category: (row.category || 'CAR').toUpperCase(), titleType: (row.titletype || 'CLEAN').toUpperCase(),
          lotNumber: row.lotnumber || null, description: row.description || null,
          hasKeys: row.haskeys ? ['true', '1', 'oui'].includes(row.haskeys.toLowerCase()) : true,
          runAndDrive: row.runanddrive ? ['true', '1', 'oui'].includes(row.runanddrive.toLowerCase()) : false,
          buyNowPrice: Number(row.buynowprice) || null,
        } });
        result.created += 1;
      } catch (error: any) {
        result.errors.push({ line: index + 1, message: error?.code === 'P2002' ? 'NIV ou numéro de lot déjà présent' : error.message || 'Ligne invalide' });
      }
    }
    return result;
  }

  async delete(id: string) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
