import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';

export class AssignGroupsDto {
  @ApiProperty({
    description: 'Odoo user login (typically email)',
    example: 'it@hexastudio.net',
  })
  @IsString()
  @IsNotEmpty()
  login!: string;

  @ApiProperty({
    type: [String],
    description:
      'Odoo security group external IDs (XMLIDs), e.g. "project.group_project_manager"',
    example: ['project.group_project_manager', 'project.group_project_user'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  groups!: string[];
}
