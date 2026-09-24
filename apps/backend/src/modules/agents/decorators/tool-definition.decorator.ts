import { SetMetadata } from '@nestjs/common';
import { TOOL_DEFINITION_METADATA } from './constants';

export interface JsonSchemaProperty {
  type: string;
  description?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

export interface ToolDefinitionOptions {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, JsonSchemaProperty>;
    required: string[];
  };
}

export const ToolDefinition = (definition: ToolDefinitionOptions) =>
  SetMetadata(TOOL_DEFINITION_METADATA, definition);
