import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Injectable()
export class UsersBootstrap implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.usersService.ensureDefaultAdmin();
  }
}
