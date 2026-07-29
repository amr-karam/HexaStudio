import { IsUUID, IsEnum } from 'class-validator';
import { ChannelMemberRole } from '../entities/channel-member.entity';

export class AddChannelMemberDto {
  @IsUUID()
  userId: string;

  @IsEnum(ChannelMemberRole)
  role: ChannelMemberRole;
}