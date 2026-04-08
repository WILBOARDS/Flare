import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../entities/notification.entity';

export interface CreateNotificationDto {
  recipientId: string;
  actorId: string;
  type: 'like' | 'comment' | 'follow';
  postId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<void> {
    await this.repo.save(
      this.repo.create({
        recipientId: dto.recipientId,
        actorId: dto.actorId,
        type: dto.type,
        postId: dto.postId ?? null,
      }),
    );
  }

  async findForUser(userId: string, cursor?: string, limit = 20) {
    const qb = this.repo
      .createQueryBuilder('n')
      .leftJoinAndSelect('n.actor', 'actor')
      .where('n.recipientId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      qb.andWhere('n.createdAt < :cursor', { cursor: decoded });
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    if (hasMore) rows.pop();

    const unreadCount = await this.repo.count({
      where: { recipientId: userId, read: false },
    });

    const nextCursor =
      hasMore && rows.length > 0
        ? Buffer.from(rows[rows.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return { notifications: rows, nextCursor, hasMore, unreadCount };
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update()
      .set({ read: true })
      .where('recipientId = :userId AND read = false', { userId })
      .execute();
  }

  async markOneRead(id: string, userId: string): Promise<void> {
    await this.repo.update({ id, recipientId: userId }, { read: true });
  }
}
