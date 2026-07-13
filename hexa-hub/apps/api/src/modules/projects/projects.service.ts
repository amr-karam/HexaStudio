import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { OdooService } from '../../odoo/odoo.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly odooService: OdooService,
  ) {}

  async findAll() {
    return this.projectRepo.find({ relations: ['owner', 'workspace'] });
  }

  async findOne(id: string) {
    return this.projectRepo.findOne({ 
      where: { id }, 
      relations: ['owner', 'workspace'] 
    });
  }

  async create(data: Partial<Project>) {
    const project = this.projectRepo.create(data);
    return this.projectRepo.save(project);
  }

  async syncWithOdoo(id: string) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) return;

    // Example: Syncing project to Odoo CRM
    const odooData = await this.odooService.searchRead('project.project', [['x_slug', '=', project.slug]]);
    if (odooData.length > 0) {
      await this.odooService.write('project.project', odooData[0].id, {
        name: project.title,
        description: project.description,
      });
    }
  }
}
