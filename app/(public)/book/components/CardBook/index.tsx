import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  addFavoriteAsync,
  removeFavoriteAsync,
  getFavoritesAsync,
} from "@/service/favorites/favoritesService";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CardNovelProps {
  novel: Novel;
}

export default function CardBook({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
  } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);

  const hasProcessedRef = useRef(false);

  const isFavorite =
    isAuthenticated &&
    favorites.some((fav) => {
      const favNovelId = String(fav.novel_id);
      const currentNovelId = String(novel.id);
      return favNovelId === currentNovelId;
    });

  useEffect(() => {
    if (isAuthenticated && !hasLoadedFavorites && !favoritesLoading) {
      dispatch(getFavoritesAsync());
      setHasLoadedFavorites(true);
    }

    if (!isAuthenticated) {
      setHasLoadedFavorites(false);
    }
  }, [dispatch, isAuthenticated, hasLoadedFavorites, favoritesLoading]);

  useEffect(() => {
    console.log("=== FAVORITO DEBUG ===");
    console.log("novel.id:", novel.id, typeof novel.id);
    console.log(
      "favorites:",
      favorites.map((f) => ({
        id: f.id,
        novel_id: f.novel_id,
        novel_id_type: typeof f.novel_id,
      }))
    );
    console.log("isFavorite calculated:", isFavorite);
    console.log("favorites.length:", favorites.length);
    console.log("====================");
  }, [favorites, novel.id, isFavorite]);

  useEffect(() => {
    if (favoritesError) {
      toast.error("Error al cargar favoritos");
    }
  }, [favoritesError]);

  useEffect(() => {
    if (isProcessing && !favoritesLoading) {
      const timer = setTimeout(() => {
        setIsProcessing(false);
        hasProcessedRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [favorites, isProcessing, favoritesLoading]);

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
        const favoriteItem = favorites.find(
          (fav) => String(fav.novel_id) === String(novel.id)
        );

        if (favoriteItem) {
          await dispatch(removeFavoriteAsync(favoriteItem.id));
          toast.warning("Novela eliminada de la estantería", {
            position: "top-right",
          });
        }
      } else {
        await dispatch(addFavoriteAsync(novel.id));
        toast.success("Novela añadida a la estantería", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error al gestionar favoritos:", error);
      toast.error("Error al gestionar favoritos");
      setIsProcessing(false);
      hasProcessedRef.current = false;
    }
  };

  const navigateToBook = () => {
    router.push(`/book/${novel.id}`);
  };

  const { title, image, category } = novel;

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Layout único que se adapta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Título - Mobile: orden 1, Desktop: columna 2-3 */}
          <h3
            className="font-bold text-lg text-center md:text-left leading-tight line-clamp-1 text-foreground hover:text-primary transition-colors order-1 md:order-2 md:col-span-2"
            title={title || ""}
          >
            {title || "Sin título"}
          </h3>

          {/* Imagen - Mobile: orden 2, Desktop: columna 1 (ocupa todas las filas) */}
          <div className="flex justify-center  items-center order-2 md:order-1 md:row-span-3 md:col-span-1">
            <Image
              src={image || "/placeholder.svg"}
              alt={title || "Portada de novela sin título"}
              width={200}
              height={200}
              className="object-cover rounded-sm hover:opacity-80 transition-opacity"
            />
          </div>

          {/* Categoría - Mobile: orden 3, Desktop: columna 2-3 */}
          <p className="text-xs text-muted-foreground text-center md:text-left order-3 md:order-3 md:col-span-2">
            Categoría: {category || "Sin categoría"}
          </p>

          {/* Botones - Mobile: orden 4, Desktop: columna 2-3 */}
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center gap-2 order-4 md:order-4 md:col-span-2">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white md:col-span-1"
              onClick={navigateToBook}
            >
              Leer
            </Button>

            {isAuthenticated ? (
              <Button
                variant={isFavorite ? "secondary" : "outline"}
                className={`border-border md:col-span-2 ${
                  isFavorite
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground"
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
            ) : (
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
      </div>
    </Card>
  );
}