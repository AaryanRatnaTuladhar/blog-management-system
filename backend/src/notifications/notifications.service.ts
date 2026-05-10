import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity.js';
import { Notification } from './notification.entity.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(user: User, type: string, payload: Record<string, unknown>) {
    return this.repo.save(this.repo.create({ user, type, payload }));
  }

  list(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markRead(userId: string, id: string) {
    await this.repo.update({ id, user: { id: userId } }, { isRead: true });
    return { success: true };
  }
}
