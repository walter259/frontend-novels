// components/ChapterContent/index.tsx
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TypeIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

interface ChapterContentProps {
  chapter: Chapter;
}

export default function ChapterContent({ chapter }: ChapterContentProps) {
  const [fontSize, setFontSize] = useState(16); // Tamaño de fuente por defecto
  
  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(fontSize + 2);
  };
  
  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(fontSize - 2);
  };
  
  const resetFontSize = () => {
    setFontSize(16);
  };

  return (
    <Card className="overflow-hidden">
      {/* Controles de lectura */}
      <div className="px-6 py-3 border-b border-border/50 bg-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tamaño de texto:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="h-8 w-8 p-0"
            >
              <ZoomOutIcon className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFontSize}
              className="h-8 px-3 text-xs"
            >
              {fontSize}px
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
              className="h-8 w-8 p-0"
            >
              <ZoomInIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Contenido del capítulo */}
      <div className="p-6 md:p-8 lg:p-12">
        <div 
          className="prose prose-gray dark:prose-invert max-w-none"
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.content ? (
            <div 
              className="leading-relaxed text-foreground"
              style={{ lineHeight: '1.8' }}
              dangerouslySetInnerHTML={{ 
                __html: chapter.content.replace(/\n/g, '<br />') 
              }}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Este capítulo no tiene contenido disponible.</p>
              <p className="text-sm mt-2">Puede que aún esté siendo escrito o editado.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Información adicional del capítulo */}
      {chapter.created_at && (
        <div className="px-6 py-3 border-t border-border/50 bg-accent/5">
          <div className="text-xs text-muted-foreground text-center">
            Publicado el {new Date(chapter.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      )}
    </Card>
  );
}