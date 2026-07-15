import { Module, Global, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { OdooModule } from '../odoo/odoo.module';
import { VectorModule } from '../vector/vector.module';

@Global()
@Module({
  imports: [HttpModule, OdooModule, forwardRef(() => VectorModule)],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
