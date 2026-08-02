import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CacheManagerService } from '../../common/cache/cache.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cacheManager: CacheManagerService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = this.cacheManager.generateKey('user:email', email);
    return this.cacheManager.watch(cacheKey, () => 
      this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email })
        .addSelect('user.password')
        .addSelect('user.twoFactorSecret')
        .getOne()
    );
  }

  async findById(id: string): Promise<User | null> {
    const cacheKey = this.cacheManager.generateKey('user:id', id);
    return this.cacheManager.watch(cacheKey, () => 
      this.userRepository.findOne({ where: { id } })
    );
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);
    
    // Clear relevant caches
    await this.cacheManager.del(this.cacheManager.generateKey('user:id', savedUser.id));
    await this.cacheManager.del(this.cacheManager.generateKey('user:email', savedUser.email));
    
    return savedUser;
  }

  async save(user: User): Promise<User> {
    const savedUser = await this.userRepository.save(user);
    
    // Clear relevant caches
    await this.cacheManager.del(this.cacheManager.generateKey('user:id', savedUser.id));
    await this.cacheManager.del(this.cacheManager.generateKey('user:email', savedUser.email));
    
    return savedUser;
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.userRepository.update(id, data);
    
    // Clear caches for this user
    await this.cacheManager.del(this.cacheManager.generateKey('user:id', id));
    // Note: We don't have the email here, so we can't clear the email cache directly
    // In a production app, you might want to fetch the user first to get the email
  }
}