import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OdooService {
  private readonly logger = new Logger(OdooService.name);
  private readonly baseUrl: string;
  private readonly db: string;
  private readonly uid: number;
  private readonly password: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('ODOO_URL') || 'http://odoo.hexastudio.net';
    this.db = this.configService.get<string>('ODOO_DB') || 'odoo';
    this.uid = parseInt(this.configService.get<string>('ODOO_UID') || '2');
    this.password = this.configService.get<string>('ODOO_PASSWORD') || 'password';
  }

  private async jsonRpc(method: string, params: any[]) {
    try {
      const response = await axios.post(`${this.baseUrl}/jsonrpc`, {
        jsonrpc: '2.0',
        method: 'call',
        params: [this.db, this.uid, this.password, method, ...params],
        id: Math.floor(Math.random() * 1000),
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      this.logger.error(`Odoo RPC Error [${method}]: ${error.message}`);
      throw error;
    }
  }

  async searchRead(model: string, domain: any[] = [], fields: string[] = []) {
    return this.jsonRpc('object', [model, 'search_read', domain, { fields }]);
  }

  async create(model: string, data: any) {
    return this.jsonRpc('object', [model, 'create', [data]]);
  }

  async write(model: string, id: number | string, data: any) {
    return this.jsonRpc('object', [model, 'write', [[id], data]]);
  }

  async read(model: string, ids: (number | string)[]) {
    return this.jsonRpc('object', [model, 'read', ids]);
  }
}
