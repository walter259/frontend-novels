import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { addFavoriteAsync, removeFavoriteAsync, getFavoritesAsync } from "@/service/favorites/favoritesService";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CardNovelProps {
  novel: Novel;
}

export default function CardBook({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Estado global de favoritos y autenticación desde Redux
  const { favorites, loading: favoritesLoading, error: favoritesError } = useSelector(
    (state: RootState) => state.favorites
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Estados locales
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);

  // Referencia para evitar múltiples clics
  const hasProcessedRef = useRef(false);

  // Calcular si es favorito directamente desde Redux state - MÁS ROBUSTO
  const isFavorite = isAuthenticated && favorites.some((fav) => {
    // Convertir ambos valores a string para comparar de forma segura
    const favNovelId = String(fav.novel_id);
    const currentNovelId = String(novel.id);
    return favNovelId === currentNovelId;
  });

  // Cargar favoritos cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && !hasLoadedFavorites && !favoritesLoading) {
      dispatch(getFavoritesAsync());
      setHasLoadedFavorites(true);
    }
    
    if (!isAuthenticated) {
      setHasLoadedFavorites(false);
    }
  }, [dispatch, isAuthenticated, hasLoadedFavorites, favoritesLoading]);

  // Debug para ver el estado
  useEffect(() => {
    console.log('=== FAVORITO DEBUG ===');
    console.log('novel.id:', novel.id, typeof novel.id);
    console.log('favorites:', favorites.map(f => ({
      id: f.id,
      novel_id: f.novel_id,
      novel_id_type: typeof f.novel_id
    })));
    console.log('isFavorite calculated:', isFavorite);
    console.log('favorites.length:', favorites.length);
    console.log('====================');
  }, [favorites, novel.id, isFavorite]);

  // Manejar errores de carga de favoritos
  useEffect(() => {
    if (favoritesError) {
      toast.error("Error al cargar favoritos");
    }
  }, [favoritesError]);

  // Resetear estado de procesamiento cuando cambian los favoritos
  useEffect(() => {
    if (isProcessing && !favoritesLoading) {
      const timer = setTimeout(() => {
        setIsProcessing(false);
        hasProcessedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [favorites, isProcessing, favoritesLoading]);

  // Manejar clic en el botón de favoritos
  const handleFavoriteAction = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para gestionar tus favoritos");
      router.push("/login");
      return;
    }

    if (hasProcessedRef.current || isProcessing) return;

    hasProcessedRef.current = true;
    setIsProcessing(true);

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const favoriteItem = favorites.find((fav) => String(fav.novel_id) === String(novel.id));
        console.log('=== ELIMINANDO FAVORITO ===');
        console.log('favoriteItem encontrado:', favoriteItem);
        
        if (favoriteItem) {
          const result = await dispatch(removeFavoriteAsync(favoriteItem.id));
          console.log('resultado removeFavorite:', result);
          toast.warning("Novela eliminada de la estantería", {
            position: "top-right",
          });
        }
      } else {
        // Añadir a favoritos
        console.log('=== AÑADIENDO FAVORITO ===');
        console.log('novel.id:', novel.id, typeof novel.id);
        
        const result = await dispatch(addFavoriteAsync(novel.id));
        console.log('resultado addFavorite:', result);
        
        
        toast.success("Novela añadida a la estantería", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error al gestionar favoritos:", error);
      toast.error("Error al gestionar favoritos");
      // Revertir estado si hay error
      setIsProcessing(false);
      hasProcessedRef.current = false;
    }
    // No usar finally aquí - dejamos que el useEffect maneje el reset
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
        <div className="flex-shrink-0 cursor-pointer" onClick={navigateToBook}>
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

          <p className="text-sm line-clamp-2 text-muted-foreground" title={description || ""}>
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
              variant={isFavorite ? "secondary" : "outline"}
              className={`border-border ${
                isFavorite ? "bg-secondary text-secondary-foreground" : "text-foreground"
              }`}
              onClick={handleFavoriteAction}
              disabled={isProcessing || favoritesLoading}
            >
              {favoritesLoading
                ? "Cargando..."
                : isProcessing
                ? isFavorite
                  ? "Eliminando..."
                  : "Añadiendo..."
                : isFavorite
                ? "Eliminar de la estantería"
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