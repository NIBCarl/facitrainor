import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname === '/'

  // No user -> Redirect to login (unless already on public route)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // User logged in handling
  if (user) {
    // Use the service role client to bypass RLS for role checking
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[Middleware] User:', user.email, '| Profile:', profile, '| Error:', error?.message)

    const isAdmin = profile?.role === 'admin'

    // Prevent logged-in users from seeing login/home
    if (isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/admin/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }

    // Prevent non-admins from accessing admin routes
    if (!isAdmin && request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Prevent admins from accessing trainee routes
    if (isAdmin && !request.nextUrl.pathname.startsWith('/admin') && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
