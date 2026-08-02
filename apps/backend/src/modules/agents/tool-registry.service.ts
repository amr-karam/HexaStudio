import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GatekeeperService } from './gatekeeper.service';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { TOOL_DEFINITION_METADATA, TOOL_AUTHORIZATION_METADATA } from './decorators/constants';
import { ToolDefinitionOptions } from './decorators/tool-definition.decorator';
import { ToolAuthorizationOptions } from './decorators/tool-authorization.decorator';
import type { User } from '@hexastudio/types';

interface ToolMetadata {
  instance: any;
  method: (params: any) => Promise<any>;
  definition: ToolDefinitionOptions;
  authorization?: ToolAuthorizationOptions;
}

@Injectable()
export class ToolRegistryService implements OnModuleInit {
  private readonly logger = new Logger(ToolRegistryService.name);
  private tools: Map<string, ToolMetadata> = new Map();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly gatekeeper: GatekeeperService,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    for (const provider of providers) {
      if (!provider.instance || !provider.metatype) continue;

      const prototype = Object.getPrototypeOf(provider.instance);
      const methodNames = Object.getOwnPropertyNames(prototype);

      for (const methodName of methodNames) {
        const method = prototype[methodName];
        if (typeof method !== 'function') continue;

        const definition = this.reflector.get<ToolDefinitionOptions>(TOOL_DEFINITION_METADATA, method);
        const authorization = this.reflector.get<ToolAuthorizationOptions>(TOOL_AUTHORIZATION_METADATA, method);

        if (definition) {
          this.logger.log(`Registering tool: ${definition.name}`);
          this.tools.set(definition.name, {
            instance: provider.instance,
            method: method.bind(provider.instance),
            definition,
            authorization,
          });
        }
      }
    }
  }

  async execute(name: string, params: any, user: User | undefined): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);

    if (tool.authorization) {
      await this.gatekeeper.authorize(user, name, tool.authorization);
    }

    const result = await tool.method(params);
    return JSON.stringify(result);
  }

  getDefinitions() {
      return Array.from(this.tools.values()).map(t => t.definition);
  }
}
