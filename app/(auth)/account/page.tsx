"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RootState } from "@/store/store";

export default function Account() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
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
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mi Cuenta</h1>
      <div className="mb-4 space-y-2">
        <p>
          <strong>Nombre:</strong> {user.name}
        </p>
        <p>
          <strong>Correo:</strong> {user.email}
        </p>
        <p>
          <strong>Rol:</strong> {user.role || "Usuario"}
        </p>
      </div>
      <div>
        <Link href="/auth/change-password">
          <Button>Cambiar Contraseña</Button>
        </Link>
      </div>
    </div>
  );
}