import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: cookies => {
          cookies.forEach(cookie => {
            response.cookies.set(
              cookie.name,
              cookie.value,
              cookie.options
            )
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // 🔒 Sin sesión → fuera del dashboard
  if (!session && pathname.startsWith('/dashboard')) {
    const redirect = NextResponse.redirect(
      new URL('/login', req.url)
    )
    response.cookies.getAll().forEach(c =>
      redirect.cookies.set(c)
    )
    return redirect
  }

  // 🔁 Con sesión → fuera del login
  if (session && pathname === '/login') {
    const redirect = NextResponse.redirect(
      new URL('/dashboard', req.url)
    )
    response.cookies.getAll().forEach(c =>
      redirect.cookies.set(c)
    )
    return redirect
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}

