// components/ChapterHeader/index.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, BookOpenIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChapterHeaderProps {
  novel: Novel;
  chapter: Chapter;
  chapterNumber: number;
  totalChapters: number;
}

export default function ChapterHeader({ 
  novel, 
  chapter, 
  chapterNumber, 
  totalChapters 
}: ChapterHeaderProps) {
  const router = useRouter();

  const handleBackToBook = () => {
    router.push(`/book/${novel.id}`);
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-background to-accent/5">
      <div className="space-y-4">
        {/* Botón de regreso y título de la novela */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToBook}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a la novela
          </Button>
        </div>
        
        {/* Información de la novela */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {novel.title}
          </h1>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpenIcon className="h-4 w-4" />
            <span>Capítulo {chapterNumber} de {totalChapters}</span>
            {novel.category && (
              <>
                <span>•</span>
                <span>{novel.category}</span>
              </>
            )}
          </div>
        </div>
        
        {/* Título del capítulo */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Cap. {chapter.chapter_number}
            </span>
            {chapter.title && (
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                {chapter.title}
              </h2>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}