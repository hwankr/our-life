import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 로그인 성공 후 사용자 정보를 users 테이블에 저장/업데이트
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자',
            avatar_url: user.user_metadata?.avatar_url || null,
          }, {
            onConflict: 'id'
          });
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 에러 시 홈으로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
