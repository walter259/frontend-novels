// components/ChapterNavigation/index.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChapterNavigationProps {
  novelId: number;
  previousChapter: Chapter | null;
  nextChapter: Chapter | null;
  isFirstChapter: boolean;
  isLastChapter: boolean;
}

export default function ChapterNavigation({
  novelId,
  previousChapter,
  nextChapter,
  isFirstChapter,
  isLastChapter
}: ChapterNavigationProps) {
  const router = useRouter();

  const handlePreviousChapter = () => {
    if (previousChapter) {
      router.push(`/books/${novelId}/chapters/${previousChapter.id}`);
    }
  };

  const handleNextChapter = () => {
    if (nextChapter) {
      router.push(`/books/${novelId}/chapters/${nextChapter.id}`);
    }
  };

  const handleBackToBook = () => {
    router.push(`/book/${novelId}`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Información de navegación */}
        <div className="text-center">
          <h3 className="font-semibold text-foreground mb-2">Navegación del capítulo</h3>
          <p className="text-sm text-muted-foreground">
            Usa los botones para moverte entre capítulos o regresar a la información de la novela
          </p>
        </div>

        {/* Botones de navegación - Móvil: Stack vertical, Desktop: Grid horizontal */}
        <div className="flex flex-col md:grid md:grid-cols-3 gap-3">
          {/* Botón Anterior */}
          <Button
            variant="outline"
            onClick={handlePreviousChapter}
            disabled={isFirstChapter || !previousChapter}
            className="flex items-center justify-center gap-2 h-12 md:col-span-1"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-xs text-muted-foreground">Anterior</span>
              <span className="text-sm font-medium">
                {previousChapter ? `Cap. ${previousChapter.chapter_number}` : 'Primer capítulo'}
              </span>
            </div>
          </Button>

          {/* Botón Volver a la novela */}
          <Button
            variant="secondary"
            onClick={handleBackToBook}
            className="flex items-center justify-center gap-2 h-12 md:col-span-1 bg-primary/10 hover:bg-primary/20 text-primary"
          >
            <BookOpenIcon className="h-4 w-4" />
            <div className="flex flex-col items-center">
              <span className="text-xs">Volver a</span>
              <span className="text-sm font-medium">La novela</span>
            </div>
          </Button>

          {/* Botón Siguiente */}
          <Button
            variant="outline"
            onClick={handleNextChapter}
            disabled={isLastChapter || !nextChapter}
            className="flex items-center justify-center gap-2 h-12 md:col-span-1"
          >
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Siguiente</span>
              <span className="text-sm font-medium">
                {nextChapter ? `Cap. ${nextChapter.chapter_number}` : 'Último capítulo'}
              </span>
            </div>
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Información adicional de navegación */}
        <div className="flex justify-center items-center gap-4 pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground text-center">
            {previousChapter && (
              <div>
                <span className="font-medium">Anterior:</span> {previousChapter.title || `Capítulo ${previousChapter.chapter_number}`}
              </div>
            )}
            {nextChapter && (
              <div>
                <span className="font-medium">Siguiente:</span> {nextChapter.title || `Capítulo ${nextChapter.chapter_number}`}
              </div>
            )}
            {!previousChapter && !nextChapter && (
              <div>Único capítulo disponible</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}