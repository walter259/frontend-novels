// components/CardNovel/CardNovel.tsx
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  addFavoriteAsync,
  removeFavoriteAsync,
  getFavoritesAsync,
} from "@/service/favorites/favoritesService";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { selectIsOperationLoading } from "@/store/slices/favoritesSlice";

interface CardNovelProps {
  novel: Novel;
}

export default function CardNovel({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
  } = useSelector((state: RootState) => state.favorites);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const isFavorite = favorites.some((fav) => fav.novel_id === novel.id);

  // Estado de carga por operación
  const addOperationKey = user?.id ? `${user.id}-${novel.id}-add` : '';
  const removeOperationKey = user?.id ? `${user.id}-${novel.id}-remove` : '';
  const isAddingFavorite = useSelector(selectIsOperationLoading(addOperationKey));
  const isRemovingFavorite = useSelector(selectIsOperationLoading(removeOperationKey));
  const isFavoriteOperationLoading = isAddingFavorite || isRemovingFavorite;

  // Cargar favoritos cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id && !favoritesLoading) {
      dispatch(getFavoritesAsync());
    }
  }, [dispatch, isAuthenticated, user?.id]);

  useEffect(() => {
    if (favoritesError) {
      toast.error("Error al gestionar favoritos");
    }
  }, [favoritesError]);

  const handleFavoriteAction = async () => {
    if (!isAuthenticated) {
      toast.warning("Debes iniciar sesión para añadir a favoritos");
      router.push("/login");
      return;
    }

    if (isFavoriteOperationLoading) return;

    try {
      if (isFavorite) {
        // Encontrar el favorito para obtener su ID
        const favoriteItem = favorites.find(
          (fav) => fav.novel_id === novel.id
        );
        if (favoriteItem) {
          await dispatch(removeFavoriteAsync(favoriteItem.id));
          toast.warning("Novela eliminada de la estantería");
        }
      } else {
        await dispatch(addFavoriteAsync(novel.id));
        toast.success("Novela añadida a la estantería");
      }
    } catch (error) {
      console.error("Error al gestionar favoritos:", error);
      toast.error("Error al gestionar favoritos");
    }
  };

  const navigateToBook = () => {
    router.push(`/book/${novel.id}`);
  };

  const { title, description, image, category } = novel;

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 gap-4">
        <div className="flex-shrink-0 cursor-pointer" onClick={navigateToBook}>
          <Image
            src={image || "/placeholder.svg"}
            alt={title || "Portada de novela sin título"}
            width={80}
            height={80}
            className="object-cover rounded-sm hover:opacity-80 transition-opacity"
          />
        </div>

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
          {isAuthenticated ? (
            <Button
              variant="outline"
              className={`border-border text-foreground ${
                isFavorite
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              onClick={handleFavoriteAction}
              disabled={isFavoriteOperationLoading}
            >
              {isFavoriteOperationLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isFavorite ? (
                "En la estantería"
              ) : (
                "Añadir a la estantería"
              )}
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
    </Card>
  );
}