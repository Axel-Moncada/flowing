import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-red-600">Error de Autenticación</h1>
      
      <div className="text-center space-y-4">
        <p className="text-gray-700">
          Hubo un problema con tu solicitud de autenticación.
        </p>
        
        <p className="text-sm text-gray-600">
          Esto puede deberse a:
        </p>
        
        <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
          <li>Credenciales incorrectas</li>
          <li>Email no confirmado</li>
          <li>Problema de conexión</li>
          <li>Error del servidor</li>
        </ul>
        
        <div className="pt-4">
          <Link 
            href="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Intentar de nuevo
          </Link>
        </div>
      </div>
    </div>
  )
}
