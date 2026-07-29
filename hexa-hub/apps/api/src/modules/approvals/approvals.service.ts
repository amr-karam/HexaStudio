import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval } from './entities/approval.entity';
import { ApprovalStatus } from './entities/approval.entity';

@Injectable()
export class ApprovalsService {
  constructor(@InjectRepository(Approval) private repo: Repository<Approval>) {}

  findAll() { return this.repo.find({ relations: ['requestedBy', 'reviewer'], order: { createdAt: 'DESC' } }); }

  findOne(id: string) { return this.repo.findOne({ where: { id }, relations: ['requestedBy', 'reviewer'] }); }

  create(data: Partial<Approval>) { return this.repo.save(this.repo.create(data)); }

  async approve(id: string, reviewerId: string, note?: string) {
    await this.repo.update(id, { status: ApprovalStatus.APPROVED, reviewer: { id: reviewerId }, reviewerNote: note });
    return this.findOne(id);
  }

  async reject(id: string, reviewerId: string, note?: string) {
    await this.repo.update(id, { status: ApprovalStatus.REJECTED, reviewer: { id: reviewerId }, reviewerNote: note });
    return this.findOne(id);
  }
}
