import { createClient } from '@/app/utils/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  
  const { data: user, error: userError } = await supabase.auth.getUser()
  
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
  
  let currentProfile = null
  let currentProfileError = null
  
  if (user?.user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single()
    
    currentProfile = data
    currentProfileError = error
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Debug de Autenticación</h1>
      
      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Usuario Actual (Auth)</h2>
          {userError ? (
            <p className="text-red-500">Error: {userError.message}</p>
          ) : user?.user ? (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify({
                id: user.user.id,
                email: user.user.email,
                created_at: user.user.created_at,
                user_metadata: user.user.user_metadata,
                app_metadata: user.user.app_metadata
              }, null, 2)}
            </pre>
          ) : (
            <p>No hay usuario logueado</p>
          )}
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Perfil del Usuario Actual</h2>
          {currentProfileError ? (
            <p className="text-red-500">Error: {currentProfileError.message}</p>
          ) : currentProfile ? (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(currentProfile, null, 2)}
            </pre>
          ) : (
            <p className="text-yellow-600">No se encontró perfil para este usuario</p>
          )}
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Todos los Perfiles en la DB</h2>
          {profilesError ? (
            <p className="text-red-500">Error: {profilesError.message}</p>
          ) : profiles && profiles.length > 0 ? (
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-64">
              {JSON.stringify(profiles, null, 2)}
            </pre>
          ) : (
            <p className="text-yellow-600">No hay perfiles en la base de datos</p>
          )}
        </div>
      </div>
      
      <div className="mt-6 space-x-4">
        <a 
          href="/login" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Ir a Login
        </a>
        <a 
          href="/private" 
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Ir a Página Privada
        </a>
      </div>
    </div>
  )
}
