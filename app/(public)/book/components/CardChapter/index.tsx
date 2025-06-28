// components/CardChapter/index.tsx
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BookOpenIcon, ClockIcon, EditIcon, TrashIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteChapterAsync } from "@/service/chapter/chapterService";
import { useAppDispatch } from "@/store/store";

interface ChapterCardProps {
  chapter: Chapter;
  novelId: number;
}

export default function CardChapter({ chapter, novelId }: ChapterCardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [localUser, setLocalUser] = useState(user);
  console.log(setLocalUser);
  const dispatch = useAppDispatch();

  // Manejar clic en el capítulo
  const handleClick = () => {
    router.push(`/books/${novelId}/chapters/${chapter.id}`);
  };

  // Manejar edición
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/chapters/${novelId}/edit/${chapter.id}`);
  };

  // Manejar eliminación
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmDelete = window.confirm(
      "¿Estás seguro de querer eliminar este capítulo?"
    );
    if (confirmDelete) {
      try {
        // Parámetros corregidos: (novelId, chapterId)
        await dispatch(deleteChapterAsync(novelId, chapter.id));
      } catch (error) {
        console.error("Error al eliminar capítulo:", error);
        alert("Error al eliminar el capítulo. Inténtalo de nuevo.");
      }
    }
  };

  const isAdminOrModerator =
    isAuthenticated &&
    localUser &&
    ["Admin", "Moderator"].includes(localUser.role);

  // Formatear fecha si existe
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  // Estimar tiempo de lectura basado en el contenido
  const estimateReadingTime = (content?: string) => {
    if (!content) return null;

    const wordsPerMinute = 200; // Promedio de lectura
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    return minutes > 1 ? `${minutes} min` : "< 1 min";
  };

  const formattedDate = formatDate(chapter.created_at);
  const readingTime = estimateReadingTime(chapter.content);

  return (
    <Card
      className="bg-background hover:bg-accent/10 transition-all duration-200 cursor-pointer p-4 border hover:border-primary/20 hover:shadow-sm"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icono del capítulo */}
          <div className="flex-shrink-0">
            <BookOpenIcon className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-primary">
                Capítulo {chapter.chapter_number}
              </span>

              {chapter.title && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <h3 className="text-base font-medium text-foreground truncate">
                    {chapter.title}
                  </h3>
                </>
              )}
            </div>

            {/* Metadatos adicionales */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {formattedDate && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {formattedDate}
                </span>
              )}

              {readingTime && <span>{readingTime} de lectura</span>}
            </div>
          </div>
        </div>

        {/* Botones de administrador y indicador visual */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {isAdminOrModerator && (
            <div className="flex items-center gap-1">
              <Button
                onClick={handleEdit}
                variant="ghost"
                className="cursor-pointer"
                title="Editar capítulo"
              >
                <EditIcon className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleDelete}
                variant="ghost"
                className="cursor-pointer"
                title="Eliminar capítulo"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="w-2 h-2 rounded-full bg-primary/30" />
        </div>
      </div>

      {/* Preview del contenido si existe */}
      {chapter.content && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {chapter.content.replace(/<[^>]*>/g, "").substring(0, 120)}
            {chapter.content.length > 120 && "..."}
          </p>
        </div>
      )}
    </Card>
  );
}
