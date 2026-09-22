import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  function redirectWithCookies(url) {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    return redirectResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect /dashboard, /admin, and /mentor routes
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/mentor'))) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return redirectWithCookies(url);
  }

  // Redirect authenticated users away from /login and /register
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'admin' || profile?.role === 'super_admin') {
      url.pathname = '/admin';
    } else {
      url.pathname = '/dashboard';
    }
    return redirectWithCookies(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
