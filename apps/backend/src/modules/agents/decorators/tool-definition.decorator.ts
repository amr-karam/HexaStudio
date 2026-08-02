import { SetMetadata } from '@nestjs/common';
import { TOOL_DEFINITION_METADATA } from './constants';

export interface ToolDefinitionOptions {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}

export const ToolDefinition = (definition: ToolDefinitionOptions) =>
  SetMetadata(TOOL_DEFINITION_METADATA, definition);
