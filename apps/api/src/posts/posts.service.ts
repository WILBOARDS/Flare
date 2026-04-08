import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { HashtagsService } from '../hashtags/hashtags.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repo: Repository<PostEntity>,
    private readonly hashtagsService: HashtagsService,
  ) {}

  async create(authorId: string, dto: CreatePostDto): Promise<PostEntity> {
    const post = this.repo.create({
      authorId,
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      imagePublicId: dto.imagePublicId ?? null,
      isTokenGated: dto.isTokenGated ?? false,
      requiredTokenAddress: dto.requiredTokenAddress ?? null,
    });
    const saved = await this.repo.save(post);
    // Extract hashtags in background — don't fail the post creation
    this.hashtagsService.extractAndSave(saved.id, dto.content).catch(() => {});
    return saved;
  }

  async findById(id: string): Promise<PostEntity> {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async delete(id: string, userId: string): Promise<void> {
    const post = await this.repo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');
    await this.repo.remove(post);
  }

  async search(q: string, cursor?: string, limit = 20) {
    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.content ILIKE :q', { q: `%${q}%` })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
      qb.andWhere('post.createdAt < :cursor', { cursor: decoded });
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    const nextCursor =
      hasMore && posts.length > 0
        ? Buffer.from(posts[posts.length - 1].createdAt.toISOString()).toString('base64url')
        : undefined;

    return { posts, nextCursor, hasMore };
  }
}
