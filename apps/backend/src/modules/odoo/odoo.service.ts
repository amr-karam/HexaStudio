import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import * as xmlrpc from 'xmlrpc';
import { getEnv } from '../../config/env';
import { RedisService } from '../storage/redis.service';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

@Injectable()
export class OdooService implements OnModuleInit {
  private readonly logger = new Logger(OdooService.name);
  private client: xmlrpc.Client;
  private objectClient: xmlrpc.Client;
  private uid: number | null = null;

  // Circuit Breaker State
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly FAILURE_THRESHOLD = 0.4; // 40% failure rate opens the circuit
  private readonly ABSOLUTE_FAILURE_LIMIT = 5; // Or 5 absolute failures in window
  private readonly RESET_TIMEOUT = 30000; // 30 seconds before half-open

  constructor(private readonly redisService: RedisService) {
    const env = getEnv();
    let host = env.ODOO_HOST;
    let port = env.ODOO_PORT || 8069;

    // Parse URL format if provided (e.g., "http://odoo:8069")
    try {
      if (host.startsWith('http://') || host.startsWith('https://')) {
        const url = new URL(host);
        host = url.hostname;
        port = url.port ? parseInt(url.port, 10) : port;
      }
    } catch {
      // Use as-is if URL parsing fails
    }

    this.client = xmlrpc.createClient({
      host,
      port,
      path: '/xmlrpc/2/common',
    });
    this.objectClient = xmlrpc.createClient({
      host,
      port,
      path: '/xmlrpc/2/object',
    });
  }

  onModuleInit() {
    this.logger.log('OdooService initialized. Circuit breaker is CLOSED.');
  }

  private get cacheEnabled(): boolean {
    return this.circuitState !== CircuitState.OPEN;
  }

  private async checkCircuitBreaker(): Promise<void> {
    if (this.circuitState === CircuitState.OPEN) {
      const now = Date.now();
      if (now - this.lastFailureTime > this.RESET_TIMEOUT) {
        this.circuitState = CircuitState.HALF_OPEN;
        this.logger.warn('Circuit breaker moved to HALF_OPEN. Testing connection...');
      } else {
        throw new InternalServerErrorException('Odoo circuit is OPEN. Serving cached data.');
      }
    }
  }

  private recordSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.circuitState = CircuitState.CLOSED;
      this.logger.log('Circuit breaker CLOSED. Odoo connection restored.');
    }
    this.successCount++;
    this.failureCount = Math.max(0, this.failureCount - 1);
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    const totalRequests = this.successCount + this.failureCount;
    if (totalRequests > 10 && (this.failureCount / totalRequests > this.FAILURE_THRESHOLD || this.failureCount >= this.ABSOLUTE_FAILURE_LIMIT)) {
      this.circuitState = CircuitState.OPEN;
      this.logger.error(`Circuit breaker OPENED. Failure rate: ${(this.failureCount / totalRequests * 100).toFixed(0)}% (${this.failureCount}/${totalRequests}).`);
    }
  }

  /** Lightweight health probe — calls xmlrpc/2/common version() instead of full auth. */
  async ping(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.client.methodCall('version', [], (error, value) => {
        if (error || !value) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  async authenticate(): Promise<number> {
    await this.checkCircuitBreaker();

    if (this.uid) {
      this.recordSuccess();
      return this.uid;
    }

    const env = getEnv();
    const db = env.ODOO_DB;
    const username = env.ODOO_USER;
    const password = env.ODOO_PASSWORD;

    try {
      const result = await new Promise<number>((resolve, reject) => {
        this.client.methodCall('authenticate', [db, username, password, {}], (error, value) => {
          if (error) reject(error);
          else resolve(value);
        });
      });

      this.uid = result;
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      this.logger.error(`Odoo authentication failed: ${error}`);
      throw new InternalServerErrorException('Odoo authentication failed');
    }
  }

  async execute<T = unknown>(model: string, method: string, args: unknown[]): Promise<T> {
    await this.authenticate();

    return new Promise<T>((resolve, reject) => {
      const env = getEnv();
      const password = env.ODOO_PASSWORD;
      const db = env.ODOO_DB;
      this.objectClient.methodCall('execute_kw', [db, this.uid!, password, model, method, args], (error, value) => {
        if (error) {
          this.recordFailure();
          reject(new InternalServerErrorException(`Odoo error: ${error}`));
        } else {
          this.recordSuccess();
          resolve(value as T);
        }
      });
    });
  }

  async searchRead(model: string, domain: unknown[], fields: string[], useCache = true): Promise<Record<string, unknown>[]> {
    const cacheKey = `odoo:${model}:${JSON.stringify(domain)}:${fields.join(',')}`;

    if (useCache && this.cacheEnabled) {
      const cached = await this.redisService.get<Record<string, unknown>[]>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    try {
      const ids = await this.execute<number[]>(model, 'search', [domain]);
      if (!ids || ids.length === 0) return [];

      const data = await this.execute<Record<string, unknown>[]>(model, 'read', [ids, fields]);

      if (useCache) {
        await this.redisService.set(cacheKey, data, 900); // Cache for 15 minutes
      }

      return data;
    } catch (error) {
      // Fallback to cache if available, even if circuit is open
      const cached = await this.redisService.get<Record<string, unknown>[]>(cacheKey);
      if (cached) {
        this.logger.warn(`Odoo call failed, serving stale cache for ${cacheKey}`);
        return cached;
      }
      throw error;
    }
  }

  async create(model: string, values: Record<string, unknown>): Promise<number> {
    return this.execute<number>(model, 'create', [values]);
  }

  async write(model: string, ids: number[], values: Record<string, unknown>): Promise<boolean> {
    return this.execute<boolean>(model, 'write', [ids, values]);
  }

  getCircuitState(): string {
    return this.circuitState;
  }
}
