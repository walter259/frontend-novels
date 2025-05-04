"use client";

import Link from "next/link";
import ResetPasswordForm from "./components/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col justify-center">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">JB Audio Novelas</h1>
        <p className="text-sm mt-1">Restablece tu contraseña</p>
      </div>

      <ResetPasswordForm />

      <div className="text-center mt-4">
        <p className="text-sm">
          <Link href="/login" className="text-gray-600 hover:underline">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </p>
      </div>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-200"></div>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        Al continuar, aceptas nuestros Términos de servicio y Política de
        privacidad.
      </p>
    </div>
  );
}
