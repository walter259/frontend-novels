// Componente de tarjeta para mostrar información de una novela
// Muestra portada, título, categoría, descripción y botones de acción
// Permite añadir la novela a la estantería (favoritos) si el usuario está autenticado

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { addFavoriteAsync } from "@/service/favorites/favoritesService";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CardNovelProps {
  novel: Novel; // Propiedades de la novela que se va a renderizar
}

export default function CardNovel({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Estado global de favoritos y autenticación desde Redux
  const { favorites, loading: favoritesLoading } = useSelector(
    (state: RootState) => state.favorites
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Estados locales
  const [isLocalFavorite, setIsLocalFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);

  // Referencia para evitar múltiples clics
  const hasAddedRef = useRef(false);

  // Sincronizar el estado local con el global (Redux)
  useEffect(() => {
    if (isAuthenticated) {
      const favoriteExists = favorites.some((fav) => fav.novel_id === novel.id);
      setIsLocalFavorite(favoriteExists);
    } else {
      setIsLocalFavorite(false);
    }
  }, [favorites, novel.id, isAuthenticated]);

  // Lógica para deshabilitar el botón
  const buttonDisabled =
    isLocalFavorite ||
    isAddingFavorite ||
    favoritesLoading ||
    hasAddedRef.current;

  // Manejar clic en "Añadir a la estantería"
  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      toast.warning("Debes iniciar sesión para añadir a favoritos");
      router.push("/login");
      return;
    }

    // Prevención de duplicados
    if (isLocalFavorite || hasAddedRef.current) return;

    // Marcar como añadido para evitar múltiples clics
    hasAddedRef.current = true;
    setIsAddingFavorite(true); // Actualización optimista

    try {
      setIsLocalFavorite(true);
      await dispatch(addFavoriteAsync(novel.id)); // Enviar acción Redux

      // Si no hay errores, mostramos mensaje de éxito
      toast.success("Novela añadida a la estantería", {
        position: "top-right",
      });
    } catch (error) {
      setIsLocalFavorite(false); // Revertir si falla
      hasAddedRef.current = false;
      console.error("Failed to add favorite:", error);
      toast.error("Error al añadir a favoritos");
    } finally {
      setIsAddingFavorite(false);
    }
  };

  // Función para navegar a la página del libro
  const navigateToBook = () => {
    router.push(`/book/${novel.id}`);
  };

  const { title, description, image, category } = novel;

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 gap-4">
        {/* Imagen de portada - ahora es clickable */}
        <div 
          className="flex-shrink-0 cursor-pointer" 
          onClick={navigateToBook}
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={title || "Portada de novela sin título"}
            width={80}
            height={80}
            className="object-cover rounded-sm hover:opacity-80 transition-opacity"
          />
        </div>
        {/* Información textual de la novela */}
        <div className="flex-grow space-y-2">
          <h3
            className="font-bold text-lg leading-tight line-clamp-1 text-foreground cursor-pointer hover:text-primary transition-colors"
            title={title || ""}
            onClick={navigateToBook}
          >
            {title || "Sin título"}
          </h3>

          <div className="flex gap-3 text-xs text-muted-foreground">
            <Link href="#" className="hover:underline">
              {category || "Sin categoría"}
            </Link>
          </div>

          <p
            className="text-sm line-clamp-2 text-muted-foreground"
            title={description || ""}
          >
            {description || "Sin descripción"}
          </p>
        </div>

        <div className="hidden md:flex flex-col gap-2 justify-center ml-auto">
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={navigateToBook}
          >
            Haga clic para leer
          </Button>
          {isAuthenticated && (
            <Button
              variant="outline"
              className={`border-border text-foreground ${
                isLocalFavorite ? "bg-muted" : ""
              }`}
              onClick={handleAddFavorite}
              disabled={buttonDisabled}
            >
              {isAddingFavorite
                ? "Añadiendo..."
                : hasAddedRef.current || isLocalFavorite
                ? "En la estantería"
                : "Añadir a la estantería"}
            </Button>
          )}
          {!isAuthenticated && (
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => router.push("/login")}
            >
              Añadir a la estantería
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}