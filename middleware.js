import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/mentor');
  const isAuthPath = pathname === '/login' || pathname === '/register';

  // 1. If public route (e.g. /, /checkout, API), bypass middleware instantly in 0ms
  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next({ request });
  }

  // 2. Fast-path cookie check: Supabase SSR stores tokens in cookies like sb-<ref>-auth-token
  const cookies = request.cookies.getAll();
  const hasAuthCookie = cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );

  // If unauthenticated guest visits a protected route, redirect to /login immediately without network call (0ms)
  if (isProtectedPath && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // If unauthenticated guest visits /login or /register, allow immediately without network call (0ms)
  if (isAuthPath && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  // At this point, auth cookie exists. Initialize Supabase SSR to refresh session tokens
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

  // If protected route and user token expired or invalid
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return redirectWithCookies(url);
  }

  // If already authenticated and visiting /login or /register, redirect to dashboard
  if (user && isAuthPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return redirectWithCookies(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
