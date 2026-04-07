import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const oauthError = requestUrl.searchParams.get('error');
  const oauthErrorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  // Handle OAuth error redirects (e.g. user cancelled consent, provider not enabled)
  if (oauthError) {
    const isProviderError =
      oauthError === 'access_denied' ||
      /unsupported provider|not enabled/i.test(oauthErrorDescription ?? '');
    const errorParam = isProviderError ? 'provider_not_enabled' : 'oauth_error';
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
  }

  // Default destination — main layout redirects to /onboarding if username not yet set
  let redirectTo = `${origin}/feed`;

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectTo = `${origin}/login?error=confirmation_failed`;
    }
  }

  return NextResponse.redirect(redirectTo);
}
