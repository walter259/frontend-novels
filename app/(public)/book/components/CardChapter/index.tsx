// components/CardChapter/index.tsx
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ChapterCardProps {
  chapter: Chapter;
  novelId: number;
}

export default function CardChapter({ chapter, novelId }: ChapterCardProps) {
  const router = useRouter();

  // Manejar clic en el capítulo
  const handleClick = () => {
    router.push(`/books/${novelId}/chapters/${chapter.id}`);
  };

  return (
    <Card 
      className="bg-background hover:bg-accent/10 transition-colors cursor-pointer p-4"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Capítulo {chapter.chapter_number}
          </span>

          <h3 className="text-base font-medium text-foreground">
            {chapter.title || "Sin título"}
          </h3>
        </div>
      </div>
    </Card>
  );
}