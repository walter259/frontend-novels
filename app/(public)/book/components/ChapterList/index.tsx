// components/ChapterList/index.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import ChapterCard from "../CardChapter/index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import api from "@/service/api";

interface ChapterListProps {
  novelId: number;
}

export default function ChapterList({ novelId }: ChapterListProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Estados locales
  const [sortAscending, setSortAscending] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar capítulos al montar el componente
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar la API directamente en lugar de Redux para evitar problemas de tipo
        const response = await api.get(`/novels/${novelId}/chapters`);
        if (response.data && response.data.chapters) {
          setChapters(response.data.chapters);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setError("Error al cargar los capítulos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChapters();
  }, [novelId]);
  
  // Ordenar capítulos
  const sortedChapters = [...chapters].sort((a, b) => {
    return sortAscending 
      ? a.chapter_number - b.chapter_number 
      : b.chapter_number - a.chapter_number;
  });
  
  // Manejar cambio de orden
  const toggleSortOrder = () => {
    setSortAscending(!sortAscending);
  };
  
  if (loading) {
    return (
      <Card className="w-full p-6">
        <div className="text-center">Cargando capítulos...</div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full p-6">
        <div className="text-center text-red-500">
          Error al cargar los capítulos. Inténtalo de nuevo.
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Capítulos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSortOrder}
          className="flex items-center gap-2"
        >
          Ordenar {sortAscending ? "Primero → Último" : "Último → Primero"}
          {sortAscending ? (
            <ArrowUpIcon className="h-4 w-4" />
          ) : (
            <ArrowDownIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {chapters.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Esta novela aún no tiene capítulos disponibles.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              novelId={novelId}
            />
          ))}
        </div>
      )}
    </Card>
  );
}