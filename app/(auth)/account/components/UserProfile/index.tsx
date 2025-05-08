"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toast } from "sonner";
import Link from "next/link";

export default function UserProfile() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const [isClient, setIsClient] = useState(false); // Controla si estamos en el cliente

  useEffect(() => {
    setIsClient(true); // Marca que estamos en el cliente después del montaje
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para acceder a esta página");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Evita renderizar contenido hasta que estemos en el cliente
  if (!isClient) {
    return null; // No renderiza nada durante SSR
  }

  if (!isAuthenticated || !user) {
    return <div>Redirigiendo...</div>;
  }

  return (
    <div className="w-full max-w-md ">
      <div className="flex justify-end p-4">
       <Link href="/novels"> <X className="h-5 w-5 text-gray-500 cursor-pointer" /></Link>
      </div>

      <div className="px-4">
        {/* Name field */}
        <div className="py-6 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Tu nombre</span>
            <span className="text-sm">{user.name}</span>
          </div>
        </div>

        {/* Email field */}
        <div className="py-6 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Correo</span>
            <span className="text-sm">{user.email}</span>
          </div>
        </div>

        {/* Username field */}
        <div className="py-6 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Nombre de usuario</span>
            <span className="text-sm">{user.user}</span>
          </div>
        </div>

        {/* Role field */}
        <div className="py-6 border-b">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Rol</span>
            <span className="text-sm">{user.role}</span>
          </div>
        </div>

        {/* Change password button */}
        <div className="py-6 flex justify-center">
          <Button>
            <Link href="/change-password">Cambiar contraseña</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
