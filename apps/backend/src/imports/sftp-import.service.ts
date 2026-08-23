import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SftpClient from 'ssh2-sftp-client';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class SftpImportService {
  private readonly logger = new Logger(SftpImportService.name);
  constructor(private readonly config: ConfigService, private readonly vehicles: VehiclesService) {}

  status() { return { configured: Boolean(this.config.get('sftp.host') && this.config.get('sftp.username') && this.config.get('sftp.remotePath')), remotePath: this.config.get('sftp.remotePath') || null }; }

  async syncCsv() {
    const host = this.config.get<string>('sftp.host'); const username = this.config.get<string>('sftp.username'); const password = this.config.get<string>('sftp.password'); const remotePath = this.config.get<string>('sftp.remotePath');
    if (!host || !username || !password || !remotePath) throw new BadRequestException('SFTP non configuré : définissez SFTP_HOST, SFTP_USERNAME, SFTP_PASSWORD et SFTP_REMOTE_PATH');
    const client = new SftpClient();
    try { await client.connect({ host, port: Number(this.config.get('sftp.port') || 22), username, password }); const file = await client.get(remotePath); const csv = Buffer.isBuffer(file) ? file.toString('utf8') : String(file); const result = await this.vehicles.importCsv(csv); this.logger.log(`Import SFTP terminé : ${result.created} véhicule(s) créés`); return { source: 'SFTP', ...result }; } finally { await client.end().catch(() => undefined); }
  }
}
