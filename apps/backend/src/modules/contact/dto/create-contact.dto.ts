import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const CreateContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  service: z.string().optional(),
  budget: z.enum(['under_50k', '50k_100k', '100k_500k', '500k_plus']).optional(),
  message: z.string().min(1),
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;

export class CreateContactDtoClass {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the sender' })
  name!: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the sender' })
  email!: string;

  @ApiPropertyOptional({ example: 'Acme Corp', description: 'Company name (optional)' })
  company?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number (optional)' })
  phone?: string;

  @ApiPropertyOptional({ example: 'residential', description: 'Service slug (e.g. "residential", "commercial")' })
  service?: string;

  @ApiPropertyOptional({ example: '100k_500k', description: 'Budget range: under_50k, 50k_100k, 100k_500k, 500k_plus' })
  budget?: 'under_50k' | '50k_100k' | '100k_500k' | '500k_plus';

  @ApiProperty({ example: 'I would like to discuss a project...', description: 'Message content' })
  message!: string;
}
