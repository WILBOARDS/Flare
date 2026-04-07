import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity)
    private readonly repo: Repository<PostEntity>,
  ) {}

  async create(authorId: string, dto: CreatePostDto): Promise<PostEntity> {
    const post = this.repo.create({
      authorId,
      content: dto.content,
      imageUrl: dto.imageUrl ?? null,
      imagePublicId: dto.imagePublicId ?? null,
    });
    return this.repo.save(post);
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
}
