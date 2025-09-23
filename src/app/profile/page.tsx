import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'
import { logout } from '@/app/login/actions'

export default async function PrivatePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Perfil de Usuario</h1>
      
      <div className="space-y-4">
        {profile?.avatar_url && (
          <div className="flex justify-center">
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full"
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email:</label>
          <p className="mt-1 text-sm text-gray-900">{data.user.email}</p>
        </div>
        
        {profile?.full_name && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre:</label>
            <p className="mt-1 text-sm text-gray-900">{profile.full_name}</p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700">ID de Usuario:</label>
          <p className="mt-1 text-sm text-gray-900 break-all">{data.user.id}</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Registrado:</label>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(data.user.created_at || '').toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <form className="mt-6">
        <button 
          formAction={logout}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cerrar Sesión
        </button>
      </form>
    </div>
  )
}
