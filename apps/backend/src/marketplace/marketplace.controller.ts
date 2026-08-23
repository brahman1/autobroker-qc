import { Body, Controller, Delete, Get, Param, Patch, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlatformRole, Roles, StaffRoles } from '../common/decorators/roles.decorator';
import { MarketplaceService } from './marketplace.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Get('watchlist') watchlist(@Request() req) { return this.marketplace.watchlist(req.user.id); }
  @Post('watchlist/:vehicleId') addWatchlist(@Request() req, @Param('vehicleId') vehicleId: string) { return this.marketplace.addWatchlist(req.user.id, vehicleId); }
  @Delete('watchlist/:vehicleId') removeWatchlist(@Request() req, @Param('vehicleId') vehicleId: string) { return this.marketplace.removeWatchlist(req.user.id, vehicleId); }

  @Get('saved-searches') savedSearches(@Request() req) { return this.marketplace.savedSearches(req.user.id); }
  @Post('saved-searches') saveSearch(@Request() req, @Body() body: { name: string; filters: Record<string, unknown> }) { return this.marketplace.saveSearch(req.user.id, body); }
  @Delete('saved-searches/:id') deleteSavedSearch(@Request() req, @Param('id') id: string) { return this.marketplace.deleteSavedSearch(req.user.id, id); }

  @Get('notifications') notifications(@Request() req) { return this.marketplace.notifications(req.user.id); }
  @Get('communications/my') communications(@Request() req) { return this.marketplace.communications(req.user.id); }
  @Patch('notifications/:id/read') markNotificationRead(@Request() req, @Param('id') id: string) { return this.marketplace.markNotificationRead(req.user.id, id); }

  @Get('offers/my') myOffers(@Request() req) { return this.marketplace.myOffers(req.user.id); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS) @Get('offers') allOffers() { return this.marketplace.allOffers(); }
  @Post('offers') createOffer(@Request() req, @Body() body: { vehicleId: string; amount: number; auctionId?: string }) { return this.marketplace.createOffer(req.user.id, body); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS) @Patch('offers/:id') reviewOffer(@Request() req, @Param('id') id: string, @Body('status') status: 'ACCEPTED' | 'DECLINED') { return this.marketplace.reviewOffer(id, status, req.user.id); }

  @Post('buy-now/:vehicleId') buyNow(@Request() req, @Param('vehicleId') vehicleId: string) { return this.marketplace.buyNow(req.user.id, vehicleId); }

  @Get('orders/my') myOrders(@Request() req) { return this.marketplace.myOrders(req.user.id); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.FINANCE, PlatformRole.SUPPORT) @Get('orders') allOrders() { return this.marketplace.allOrders(); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS) @Patch('orders/:id/status') updateOrder(@Request() req, @Param('id') id: string, @Body('status') status: string) { return this.marketplace.updateOrderStatus(id, status, req.user.id); }

  @Get('documents/my') documents(@Request() req) { return this.marketplace.documents(req.user.id); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.FINANCE, PlatformRole.SUPPORT) @Get('documents') allDocuments() { return this.marketplace.allDocuments(); }
  @Get('documents/:id/download') async downloadDocument(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const document = await this.marketplace.downloadableDocument(id, req.user.id, req.user.role);
    const lines = ['AutoBroker QC', document.type === 'INVOICE' ? 'Facture' : 'Contrat d’achat', `Document : ${document.fileName}`, `Commande : ${document.order?.orderNumber || '—'}`, `Véhicule : ${document.order?.vehicle ? `${document.order.vehicle.year} ${document.order.vehicle.make} ${document.order.vehicle.model}` : '—'}`, `Émis le : ${document.createdAt.toLocaleDateString('fr-CA')}`, 'Document simulé — à ne pas utiliser comme document contractuel final.'];
    const content = lines.map((line, index) => `BT /F1 ${index < 2 ? 18 : 11} Tf 54 ${760 - index * 35} Td (${line.replace(/[\\()]/g, '\\$&')}) Tj ET`).join('\n');
    const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`];
    let pdf = '%PDF-1.4\n'; const offsets = [0];
    objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = Buffer.byteLength(pdf); pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.send(Buffer.from(pdf, 'utf8'));
  }

  @Get('disputes/my') myDisputes(@Request() req) { return this.marketplace.myDisputes(req.user.id); }
  @Post('disputes') createDispute(@Request() req, @Body() body: { orderId?: string; subject: string; description: string }) { return this.marketplace.createDispute(req.user.id, body); }
  @UseGuards(RolesGuard) @Roles(...StaffRoles) @Get('disputes') allDisputes() { return this.marketplace.allDisputes(); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.SUPPORT) @Patch('disputes/:id') updateDispute(@Request() req, @Param('id') id: string, @Body() body: { status?: string; resolution?: string }) { return this.marketplace.updateDispute(id, body, req.user.id); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.FINANCE) @Get('audit-logs') auditLogs() { return this.marketplace.auditLogs(); }

  @Post('transport/quotes') quoteTransport(@Request() req, @Body() body: { vehicleId: string; destinationPostalCode: string; serviceLevel?: string; orderId?: string }) { return this.marketplace.transportQuote(req.user.id, body); }
  @Get('transport/quotes/my') myTransportQuotes(@Request() req) { return this.marketplace.myTransportQuotes(req.user.id); }
  @UseGuards(RolesGuard) @Roles(PlatformRole.ADMIN, PlatformRole.OPERATIONS, PlatformRole.SUPPORT) @Get('transport/quotes') allTransportQuotes() { return this.marketplace.allTransportQuotes(); }
}
