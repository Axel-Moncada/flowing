import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      console.log('Google login successful for user:', data.user.id)
      console.log('User metadata:', data.user.user_metadata)
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
          email: data.user.email,
          avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Error updating profile:', profileError)
        // No redirigir a error si el perfil falla - el usuario ya está autenticado
        console.log('Profile error but user is authenticated, continuing...')
      } else {
        console.log('Profile updated successfully')
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login/error`)
}
