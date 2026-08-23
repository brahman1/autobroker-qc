import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly prisma: PrismaService) {}
  @Get('sitemap.xml')
  async sitemap(@Res() res: Response) {
    const vehicles = await this.prisma.vehicle.findMany({ select: { id: true, make: true, model: true, category: true, updatedAt: true }, take: 5000 });
    const base = process.env.PUBLIC_WEB_URL || 'https://autobrokerqc.ca';
    const staticUrls = ['/', '/vehicules', '/comparer'];
    const urls = new Set([...staticUrls, ...vehicles.map((vehicle) => `/vehicules/${vehicle.id}`), ...vehicles.map((vehicle) => `/categorie/${vehicle.category.toLowerCase()}`), ...vehicles.map((vehicle) => `/marque/${encodeURIComponent(vehicle.make)}`), ...vehicles.map((vehicle) => `/modele/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}`)]);
    const body = [...urls].map((path) => `<url><loc>${base}${path}</loc><changefreq>daily</changefreq><priority>${path.startsWith('/vehicules/') ? '0.8' : '0.6'}</priority></url>`).join('');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`);
  }
}
