import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async createUser(
    email: string,
    passwordHash: string,
    role: UserRole = 'user',
  ) {
    const user = this.usersRepo.create({ email, passwordHash, role });
    return this.usersRepo.save(user);
  }

  listUsers() {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async setActive(id: string, isActive: boolean) {
    await this.usersRepo.update({ id }, { isActive });
    return this.findById(id);
  }

  async ensureDefaultAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;
    const existing = await this.findByEmail(email);
    if (existing) return;
    const hash = await bcrypt.hash(password, 10);
    await this.createUser(email, hash, 'admin');
  }
}
