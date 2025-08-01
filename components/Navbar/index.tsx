"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import NavLinks from "./nav-links";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ChevronUp, User2, Plus } from "lucide-react";
import LogoutButton from "../LogoutButton";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/service/auth/authService";
import { Button } from "../ui/button";
import ModeToggle from "../ModeToggle";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && (!user || !user.role)) {
        const fetchedUser = await getCurrentUser();
        setLocalUser(fetchedUser); // Actualiza el estado local después de fetch
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [user, isAuthenticated]);

  if (isLoading) {
    return <div>Cargando...</div>; // Renderizado inicial mientras se carga el usuario
  }

  // Verifica si el usuario es admin o moderador
  const isAdminOrModerator =
    isAuthenticated &&
    localUser &&
    ["Admin", "Moderator"].includes(localUser.role);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Botón de Crear - colocado antes del menú de navegación */}

            <SidebarMenu>
              <NavLinks />
            </SidebarMenu>

            {isAdminOrModerator && (
              <SidebarMenu className="mb-4">
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href="/create"
                    className="flex items-center justify-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear
                  </Link>
                </Button>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {isAuthenticated && localUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full flex items-center justify-between">
                    <div className="flex items-center">
                      <User2 className="mr-2" />
                      <div className="flex flex-col">
                        <span>{localUser.name}</span>
                        <span className="text-xs text-gray-500">
                          {localUser.role || "Cargando rol..."}
                        </span>
                      </div>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <ModeToggle />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/account" className="w-full text-center">
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="flex self-center">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
