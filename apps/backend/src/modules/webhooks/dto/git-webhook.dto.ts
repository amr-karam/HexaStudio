import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class GitWebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  prTitle: string;

  @IsString()
  @IsNotEmpty()
  prDescription: string;

  @IsString()
  @IsNotEmpty()
  diffSummary: string;

  @IsString()
  @IsNotEmpty()
  repo: string;

  @IsNumber()
  prNumber: number;
}
