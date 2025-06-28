"use client";

import type React from "react";
import Link from "next/link";

import ResetForm from "./components/ResetForm";
import { ArrowLeft } from "lucide-react";

export default function Reset() {
  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col justify-center">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold"><Link href="/login"><ArrowLeft/></Link>JB Audio Novelas</h1>
        <p className="text-sm mt-1">Reestablece contraseña</p>
      </div>

      <ResetForm />

      <div className="text-center mt-4">
        <p className="text-sm">
          <Link href="/login" className="text-gray-600 hover:underline">
            ¿Ya tienes un enlace? Inicia sesión
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