'use client'
import { logout } from '@/app/(public)/login/actions'
import { useUser } from '@/app/context/UserContext'

export default function ProfilePage() {
  const user = useUser()
  
  console.log('Usuario data:', user)
  
  return (
    <div className="w-full h-full p-6">
      <h1 className="text-3xl font-bold mb-8 text-crema">Perfil de Usuario</h1>
      
      {/* Grid layout que ocupa todo el ancho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* Columna 1: Avatar y info básica */}
        <div className="bg-gris rounded-lg p-6 h-fit">
          {user?.user_metadata?.avatar_url && (
            <div className="flex justify-center mb-6">
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full border-4 border-verde"
              />
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-verde mb-2">
              {user?.user_metadata?.full_name || 'Usuario'}
            </h2>
            <p className="text-crema">{user.email}</p>
          </div>
        </div>

        {/* Columna 2: Detalles del perfil */}
        <div className="bg-gris rounded-lg p-6 h-fit">
          <h3 className="text-lg font-semibold text-verde mb-4">Información Personal</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-verde">Email:</label>
              <p className="mt-1 text-crema">{user.email}</p>
            </div>
            
            {user?.user_metadata?.full_name && (
              <div>
                <label className="block text-sm font-medium text-verde">Nombre Completo:</label>
                <p className="mt-1 text-crema">{user.user_metadata.full_name}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-verde">Fecha de Registro:</label>
              <p className="mt-1 text-crema">
                {new Date(user!.created_at || '').toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Columna 3: Acciones y configuración */}
        <div className="bg-gris rounded-lg p-6 h-fit">
          <h3 className="text-lg font-semibold text-verde mb-4">Acciones</h3>
          <div className="space-y-4">
            <button className="w-full bg-verde hover:bg-verde/80 text-negro font-bold py-3 px-4 rounded-lg transition-colors">
              Editar Perfil
            </button>
            
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Configuración
            </button>
            
            <form>
              <button 
                formAction={logout}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-verde/20">
              <label className="block text-xs font-medium text-verde/70">ID de Usuario:</label>
              <p className="mt-1 text-xs text-crema/70 break-all">{user!.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
