import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { typeOrmConfig } from './data-source';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/users/entities/user-role.enum';
import { Workspace } from '../modules/workspaces/entities/workspace.entity';

async function seed() {
  const ds = new DataSource({ ...typeOrmConfig, synchronize: true });
  await ds.initialize();
  console.log('📦 Database connected. Seeding...');

  const userRepo = ds.getRepository(User);
  const wsRepo = ds.getRepository(Workspace);

  // Check if already seeded
  const existing = await userRepo.count();
  if (existing > 0) {
    console.log('✅ Database already seeded. Skipping.');
    await ds.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Seed admin user
  const admin = userRepo.create({
    email: 'admin@hexastudio.net',
    password: hashedPassword,
    fullName: 'Admin User',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
  });
  await userRepo.save(admin);
  console.log('👤 Admin user created: admin@hexastudio.net / admin123');

  // Seed employee
  const employee = userRepo.create({
    email: 'employee@hexastudio.net',
    password: hashedPassword,
    fullName: 'Jane Architect',
    role: UserRole.EMPLOYEE,
    isActive: true,
  });
  await userRepo.save(employee);
  console.log('👤 Employee created: employee@hexastudio.net / admin123');

  // Seed client
  const client = userRepo.create({
    email: 'client@hexastudio.net',
    password: hashedPassword,
    fullName: 'John Client',
    role: UserRole.CLIENT,
    isActive: true,
  });
  await userRepo.save(client);
  console.log('👤 Client created: client@hexastudio.net / admin123');

  // Seed workspace
  const ws = wsRepo.create({
    name: 'Default Workspace',
    description: 'Main workspace for HEXA Studio operations.',
    owner: admin,
    slug: 'default',
  });
  await wsRepo.save(ws);
  console.log('🏢 Default workspace created.');

  await ds.destroy();
  console.log('✅ Seed complete.');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
