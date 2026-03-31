import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async upsertFromSupabase(data: {
    supabaseId: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  }): Promise<UserEntity> {
    const existing = await this.repo.findOne({
      where: { supabaseId: data.supabaseId },
    });

    if (existing) {
      if (data.email && !existing.email) existing.email = data.email;
      return this.repo.save(existing);
    }

    const user = this.repo.create({
      supabaseId: data.supabaseId,
      email: data.email ?? null,
      displayName: data.displayName ?? null,
      avatarUrl: data.avatarUrl ?? null,
    });
    return this.repo.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new NotFoundException(`User @${username} not found`);
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.username && dto.username !== user.username) {
      const taken = await this.repo.findOne({ where: { username: dto.username } });
      if (taken) throw new ConflictException('Username already taken');
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }
}
