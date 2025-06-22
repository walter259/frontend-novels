// components/CardNovel/CardNovel.tsx - Versión ARREGLADA
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface CardNovelProps {
  novel: Novel;
}

export default function CardNovel({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Selector simple sin timestamp
  const { favorites, isAuthenticated, user, operationLoading, favoritesLoading } = useSelector((state: RootState) => ({
    favorites: state.favorites.favorites,
    isAuthenticated: state.auth.isAuthenticated,
    user: state.auth.user,
    operationLoading: state.favorites.operationLoading,
    favoritesLoading: state.favorites.loading,
  }));

  // Cálculo directo sin useMemo innecesario
  const favoriteItem = favorites.find(fav => fav.novel_id === novel.id);
  const isFavorite = !!favoriteItem;
  
  const addKey = user?.id ? `${user.id}-${novel.id}-add` : '';
  const removeKey = user?.id ? `${user.id}-${novel.id}-remove` : '';
  const isOperationLoading = !!(operationLoading[addKey] || operationLoading[removeKey]);

  // Loader global: cualquier operación o carga de favoritos
  const isLoading = isOperationLoading || favoritesLoading;

  let buttonText = "Añadir a la estantería";
  let buttonClass = "bg-blue-500 hover:bg-blue-600 text-white";

  if (isLoading) {
    buttonText = "Procesando...";
  } else if (isFavorite) {
    buttonText = "En la estantería";
    buttonClass = "bg-red-500 hover:bg-red-600 text-white";
  }

  console.log(`🟨 RENDER Novel ${novel.id}:`, {
    favoritesCount: favorites.length,
    isFavorite,
    isLoading,
    buttonText,
    favoriteItem: favoriteItem?.id
  });

  useEffect(() => {
    if (isAuthenticated && user?.id && !favoritesLoading) {
      dispatch(getFavoritesAsync());
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const handleClick = async () => {
    console.log(`🟨 CLICK Novel ${novel.id}:`, { isFavorite, isLoading });

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isLoading) return;

    try {
      if (isFavorite && favoriteItem) {
        console.log(`🟨 REMOVING favorite ${favoriteItem.id}...`);
        await dispatch(removeFavoriteAsync(favoriteItem.id));
        toast.success("Eliminado de la estantería");
      } else {
        console.log(`🟨 ADDING favorite for novel ${novel.id}...`);
        await dispatch(addFavoriteAsync(novel.id));
        toast.success("Añadido a la estantería");
      }
    } catch (error) {
      console.error(`🟨 ERROR in handleClick:`, error);
      toast.error("Error al actualizar la estantería");
    }
  };

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 gap-4">
        <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push(`/book/${novel.id}`)}>
          <Image
            src={novel.image || "/placeholder.svg"}
            alt={novel.title || "Sin título"}
            width={80}
            height={80}
            className="object-cover rounded-sm"
          />
        </div>

        <div className="flex-grow space-y-2">
          <h3 className="font-bold text-lg cursor-pointer" onClick={() => router.push(`/book/${novel.id}`)}>
            {novel.title || "Sin título"}
          </h3>
          <div className="text-xs text-muted-foreground">
            {novel.category || "Sin categoría"}
          </div>
          <p className="text-sm text-muted-foreground">
            {novel.description || "Sin descripción"}
          </p>
        </div>

        <div className="hidden md:flex flex-col gap-2 justify-center ml-auto">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => router.push(`/book/${novel.id}`)}
          >
            Haga clic para leer
          </Button>
          
          {isAuthenticated ? (
            <Button
              variant="outline"
              className={buttonClass}
              onClick={handleClick}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => router.push("/login")}
            >
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}