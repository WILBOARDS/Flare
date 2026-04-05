import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { join } from 'path';

import configuration from './config/configuration';
import { validateConfig } from './config/validation';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppController } from './app.controller';

import { UserEntity } from './entities/user.entity';
import { PostEntity } from './entities/post.entity';
import { FollowEntity } from './entities/follow.entity';
import { LikeEntity } from './entities/like.entity';
import { CreatorTokenEntity } from './entities/creator-token.entity';
import { CommentEntity } from './entities/comment.entity';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { FeedModule } from './feed/feed.module';
import { FollowsModule } from './follows/follows.module';
import { LikesModule } from './likes/likes.module';
import { UploadModule } from './upload/upload.module';
import { TokensModule } from './tokens/tokens.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateConfig,
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        url: config.get<string>('database.url'),
        ssl: { rejectUnauthorized: false },
        entities: [UserEntity, PostEntity, FollowEntity, LikeEntity, CreatorTokenEntity, CommentEntity],
        migrations: [join(__dirname, 'database', 'migrations', '*{.ts,.js}')],
        migrationsRun: true,
        synchronize: false,
        logging: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiration') },
      }),
      global: true,
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    FeedModule,
    FollowsModule,
    LikesModule,
    UploadModule,
    TokensModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
