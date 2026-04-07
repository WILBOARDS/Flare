import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.serviceRoleKey')!,
    );
  }

  async handleCallback(accessToken: string): Promise<{ user: UserEntity; token: string }> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid Supabase token');
    }

    const supaUser = data.user;

    if (!supaUser.email_confirmed_at) {
      throw new UnauthorizedException('Email address not verified. Please check your inbox and click the verification link.');
    }

    const user = await this.usersService.upsertFromSupabase({
      supabaseId: supaUser.id,
      email: supaUser.email,
      displayName: supaUser.user_metadata?.full_name ?? undefined,
      avatarUrl: supaUser.user_metadata?.avatar_url ?? undefined,
    });

    const token = await this.jwtService.signAsync(
      { sub: user.id, supabaseId: user.supabaseId },
      { expiresIn: this.configService.get<string>('jwt.expiration') },
    );

    return { user, token };
  }
}
