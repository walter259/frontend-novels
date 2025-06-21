"use client";

import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import NovelUpdateForm from "../components/UpdateNovelForm";

export default function UpdateNovel() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Verificar si el usuario está autenticado y tiene permisos adecuados
  useEffect(() => {
    // Si no está autenticado, redirigir al login
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Si está autenticado pero no es admin o moderador, redirigir al inicio
    if (user && !["Admin", "Moderator"].includes(user.role)) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Si no está autenticado o cargando, mostrar estado de carga
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no tiene permisos adecuados, mostrar mensaje
  if (!["Admin", "Moderator"].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Acceso Denegado
          </h1>
          <p className="mb-4">No tienes permisos para acceder a esta página.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Si todo está correcto, mostrar el formulario
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Actualizar Novela</h1>
      <NovelUpdateForm novelId={id} />
    </div>
  );
}
