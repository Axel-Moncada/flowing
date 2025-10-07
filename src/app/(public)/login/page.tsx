'use client'
import { useActionState } from 'react'  // Note: from 'react', not 'react-dom'
import { login, signup, loginWithGoogle } from "./actions";
import Navbar from "@/app/components/navbar";

export default function LoginPage() {
  const [loginState, loginAction] = useActionState(login, { error: '', success: false })
  const [signupState, signupAction] = useActionState(signup, { error: '', success: false })

  return (
    <>
      <Navbar />

      
      {/* Modal de Error */}
      {signupState?.success && (
        <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
          <div className="bg-gris/80 p-10 rounded-lg max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-20">
              <h3 className="text-lg font-bold text-verde">Bienvenido, tu cuenta fue creada</h3>
              <button 
                onClick={() => window.location.reload()}
                className="text-verde hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-white mb-4">Ya puedes ingresar a tu cuenta</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-verde hover:bg-verde text-grisd py-2 rounded font-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {signupState?.error && (
        <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
          <div className="bg-gris/80 p-10 rounded-lg max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-20">
              <h3 className="text-lg font-bold text-verde">Error de Registro</h3>
              <button 
                onClick={() => window.location.reload()}
                className="text-verde hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-white mb-4">Ya puedes ingresar a tu cuenta</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-verde hover:bg-verde text-grisd py-2 rounded font-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Error de Login */}
      {loginState?.error && (
        <div className="fixed inset-0 bg-black/80  flex items-center justify-center z-50">
          <div className="bg-gris/80 p-10 rounded-lg max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-20">
              <h3 className="text-lg font-bold text-verde">!Uups, error de autenticación</h3>
              <button 
                onClick={() => window.location.reload()}
                className="text-verde hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-white mb-4">Usuario o contraseña incorrectos</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-verde hover:bg-verde text-grisd py-2 rounded font-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Error de Signup */}
      {signupState?.error && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gris/80 p-10 rounded-lg max-w-md mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4 gap-20">
              <h3 className="text-lg font-bold text-verde">Error de Registro</h3>
              <button 
                onClick={() => window.location.reload()}
                className="text-verde hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-white mb-4">{signupState.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-verde hover:bg-verde text-grisd py-2 rounded font-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="w-full justify-center content-center align-middle items-center grid grid-cols-1 md:grid-cols-2 px-70 py-10">


      <div className="w-xl h-max flex-row justify-center content-center mx-auto mt-8 p-20 bg-white rounded-4xl shadow-md border-4 border-verde ">
        <h1 className="text-4xl font-bold  text-left">Iniciar Sesión</h1>
        <p className="text-gray-600 text-sm text-left mb-6">Por favor ingresa tus credenciales</p>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email:
            </label>
            <input
              id="email-user"
              name="email-user"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Contraseña:
            </label>
            <input
              id="password-user"
              name="password-user"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          

          <div className="flex space-x-4">
            <button
              formAction={loginAction}
              className="flex-1 bg-verde hover:bg-gris hover:text-verde text-gris font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Iniciar Sesión
            </button>
            
          </div>
        </form>

        <div className="mt-6 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                O continúa con
              </span>
            </div>
          </div>
        </div>

        <form>
          <button
            formAction={loginWithGoogle}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </form>
      </div>

      <div className=" w-xl h-max flex-row justify-center content-center mx-auto mt-8 px-20 py-15 bg-white rounded-4xl shadow-md border-4 border-verde ">
        <h1 className="text-4xl font-bold  text-left">Registrate</h1>
        <p className="text-gray-600 mb-6">Crea una cuenta para acceder a todas las funciones.</p>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email:
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required={true}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gris"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Contraseña:
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required={true}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gris"
            />
          </div>

          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-400"
            >
              Nombre Completo (solo para registro):
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required={true}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gris"
            />
          </div>
          <div>
           
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-verde"
                required={true}
              />
              <span className="ml-2 text-gray-700">
                Acepto los términos y condiciones
              </span>
            </label>
          </div>

          <div className="flex space-x-4">
            
            <button
              formAction={signupAction}
              className="flex-1 bg-verde hover:bg-gris hover:text-verde text-gris font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              Registrarse
            </button>
          </div>
        </form>

        <div className="mt-6 mb-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                O continúa con
              </span>
            </div>
          </div>
        </div>

        <form>
          <button
            formAction={loginWithGoogle}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>
        </form>
      </div>



      </div>
    </>
  );
}
