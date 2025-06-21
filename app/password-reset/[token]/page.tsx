"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, use } from "react";

// Definir el tipo correcto para los parámetros
type Params = { token: string };

export default function PasswordReset({ params }: { params: Promise<Params> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Asegurar que params se maneje correctamente ya sea Promise o no
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  const email = searchParams.get("email");

  useEffect(() => {
    if (token && email) {
      router.push(`/reset-password?token=${token}&email=${email}`);
    } else {
      router.push("/reset");
    }
  }, [token, email, router]);

  return <div>Redirigiendo...</div>;
}