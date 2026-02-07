import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: createServerClient와 supabase.auth.getUser() 사이에
  // 로직을 추가하지 마세요.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 보호된 라우트 체크
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/periods'))
  ) {
    // 로그인 안 된 사용자가 보호된 페이지 접근 시 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
