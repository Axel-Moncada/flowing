'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { createClient } from '@/app/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login/error')
  }

  revalidatePath('/', 'layout')
  redirect('/private')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  console.log('Attempting signup with:', { email, fullName })

  // Signup con metadata del usuario
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null,
        avatar_url: null,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error)
    redirect('/login/error')
  }

  console.log('Signup successful, user ID:', data.user?.id)

  // Insertar en tabla profiles después del signup exitoso
  if (data.user) {
    console.log('Creating profile for user:', data.user.id)
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName || null,
        email: email,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // No redirigir a error, el usuario se creó correctamente
    } else {
      console.log('Profile created successfully')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login/error')
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    redirect('/login/error')
  }
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
