import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as xmlrpc from 'xmlrpc';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OdooService {
  private readonly logger = new Logger(OdooService.name);
  private client: xmlrpc.Client;
  private uid: number | null = null;

  constructor(private configService: ConfigService) {
    this.client = xmlrpc.createClient({
      host: this.configService.get<string>('ODOO_HOST'),
      port: this.configService.get<number>('ODOO_PORT') || 8069,
      path: '/xmlrpc/2/common',
    });
  }

  async authenticate(): Promise<number> {
    if (this.uid) return this.uid;

    try {
      const db = this.configService.get<string>('ODOO_DB');
      const username = this.configService.get<string>('ODOO_USER');
      const password = this.configService.get<string>('ODOO_PASSWORD');

      this.client.methodCall('authenticate', [db, username, password, {}], (error, value) => {
        if (error) throw error;
        this.uid = value;
      });

      // xmlrpc is callback based, wrapping it in a promise
      return new Promise((resolve, reject) => {
        this.client.methodCall('authenticate', [db, username, password, {}], (error, value) => {
          if (error) {
            this.logger.error(`Odoo authentication failed: ${error}`);
            reject(new InternalServerErrorException('Odoo authentication failed'));
          } else {
            this.uid = value;
            resolve(value);
          }
        });
      });
    } catch (error) {
      this.logger.error(`Odoo auth error: ${error}`);
      throw new InternalServerErrorException('Could not connect to Odoo');
    }
  }

  async execute<T = unknown>(model: string, method: string, args: unknown[]): Promise<T> {
    await this.authenticate();

    return new Promise((resolve, reject) => {
      const objectClient = xmlrpc.createClient({
        host: this.configService.get<string>('ODOO_HOST'),
        port: this.configService.get<number>('ODOO_PORT') || 8069,
        path: '/xmlrpc/2/object',
      });

      objectClient.methodCall(method, [this.uid!, this.configService.get<string>('ODOO_DB'), model, ...args], (error, value) => {
        if (error) {
          this.logger.error(`Odoo execution error [${model}.${method}]: ${error}`);
          reject(new InternalServerErrorException(`Odoo error: ${error}`));
        } else {
          resolve(value);
        }
      });
    });
  }

  async searchRead(model: string, domain: unknown[], fields: string[]): Promise<Record<string, unknown>[]> {
    const ids = await this.execute<number[]>(model, 'search', [domain]);
    if (!ids || ids.length === 0) return [];
    return this.execute<Record<string, unknown>[]>(model, 'read', [ids, fields]);
  }
}
