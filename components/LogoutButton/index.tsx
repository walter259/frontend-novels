// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { logoutUser } from "@/service/auth/authService";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Button onClick={handleLogout} variant="destructive">
      Cerrar Sesión
    </Button>
  );
}