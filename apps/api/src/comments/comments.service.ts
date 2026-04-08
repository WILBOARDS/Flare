import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { PostEntity } from '../entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(postId: string, authorId: string, dto: CreateCommentDto): Promise<CommentEntity> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({ postId, authorId, content: dto.content });
    const saved = await this.commentRepo.save(comment);

    await this.postRepo.manager.query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
      [postId],
    );

    // Fire notification — don't block
    if (post.authorId !== authorId) {
      this.notificationsService
        .create({ recipientId: post.authorId, actorId: authorId, type: 'comment', postId })
        .catch(() => {});
    }

    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['author'],
    }) as Promise<CommentEntity>;
  }

  async findByPost(postId: string, limit = 50, cursor?: string): Promise<CommentEntity[]> {
    const qb = this.commentRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.author', 'author')
      .where('c.post_id = :postId', { postId })
      .orderBy('c.created_at', 'ASC')
      .take(limit);

    if (cursor) {
      qb.andWhere('c.created_at > :cursor', { cursor: new Date(cursor) });
    }

    return qb.getMany();
  }

  async delete(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenException('Not your comment');

    await this.commentRepo.remove(comment);
    await this.postRepo.manager.query(
      `UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1`,
      [comment.postId],
    );
  }
}
