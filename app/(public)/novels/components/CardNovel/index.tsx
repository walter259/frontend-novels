// components/CardNovel/CardNovel.tsx
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
  novel: Novel;
}

export default function CardNovel({ novel }: CardNovelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { favorites, loading: favoritesLoading } = useSelector(
    (state: RootState) => state.favorites
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [isLocalFavorite, setIsLocalFavorite] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const hasAddedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      const favoriteExists = favorites.some((fav) => fav.novel_id === novel.id);
      setIsLocalFavorite(favoriteExists);
    } else {
      setIsLocalFavorite(false);
    }
  }, [favorites, novel.id, isAuthenticated]);

  const buttonDisabled =
    isLocalFavorite ||
    isAddingFavorite ||
    favoritesLoading ||
    hasAddedRef.current;

  const handleAddFavorite = async () => {
    if (!isAuthenticated) {
      toast.warning("Debes iniciar sesión para añadir a favoritos");
      router.push("/login");
      return;
    }

    if (isLocalFavorite || hasAddedRef.current) return;

    hasAddedRef.current = true;
    setIsAddingFavorite(true);

    try {
      setIsLocalFavorite(true);
      await dispatch(addFavoriteAsync(novel.id));
      toast.success("Novela añadida a la estantería", {
        position: "top-right",
      });
    } catch (error) {
      setIsLocalFavorite(false);
      hasAddedRef.current = false;
      console.error("Failed to add favorite:", error);
      toast.error("Error al añadir a favoritos");
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const navigateToBook = () => {
    router.push(`/book/${novel.id}`);
  };

  const { title, description, image, category } = novel;

  return (
    <Card className="overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="flex p-4 gap-4">
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