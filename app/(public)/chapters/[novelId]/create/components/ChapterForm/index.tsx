"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createChapterAsync } from "@/service/chapter/chapterService";
import { ChapterSchema } from "@/lib/validators/chapter";

interface ChapterFormProps {
  novelId: string;
  novelTitle?: string;
}

type ChapterFormData = z.infer<typeof ChapterSchema>;

export default function ChapterForm({ novelId, novelTitle }: ChapterFormProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<ChapterFormData>({
    resolver: zodResolver(ChapterSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;
  const contentValue = watch("content");
  const titleValue = watch("title");
  const charCount = contentValue?.length || 0;

  const onSubmit = async (values: ChapterFormData) => {
    try {
      console.log("Datos del capítulo:", values);

      const chapterData = {
        title: values.title,
        content: values.content,
      };

      await dispatch(createChapterAsync(Number(novelId), chapterData));

      toast.success("Capítulo creado exitosamente", {
        position: "top-right",
      });

      // Redirigir a la página de la novela
      router.push(`/book/${novelId}`);
    } catch (error) {
      console.error("Error al crear capítulo:", error);
      toast.error("Error al crear el capítulo. Inténtalo de nuevo.");
    }
  };

  const handleCancel = () => {
    const hasChanges = titleValue?.trim() || contentValue?.trim();

    if (hasChanges) {
      const confirmed = window.confirm(
        "¿Estás seguro de que quieres cancelar? Se perderán los cambios no guardados."
      );
      if (!confirmed) return;
    }
    router.back();
  };

  const getCharCountColor = () => {
    if (charCount > 45000) return "text-red-500";
    if (charCount > 40000) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold mb-2">Crear Nuevo Capítulo</h1>
        {novelTitle && (
          <p className="text-muted-foreground">
            Para la novela: <span className="font-semibold">{novelTitle}</span>
          </p>
        )}
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Capítulo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Capítulo *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Capítulo 1: El Comienzo"
                        disabled={isSubmitting}
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <span className="text-xs text-muted-foreground">
                        {titleValue?.length || 0}/200 caracteres
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Campo Contenido */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido del Capítulo *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe el contenido del capítulo aquí..."
                        className="min-h-[400px] resize-y"
                        disabled={isSubmitting}
                        maxLength={50000}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between">
                      <FormMessage />
                      <div className="text-xs">
                        <span className="text-muted-foreground mr-4">
                          Mínimo 100 caracteres
                        </span>
                        <span className={getCharCountColor()}>
                          {charCount.toLocaleString()}/50,000 caracteres
                        </span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Crear Capítulo
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Consejos para escribir:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Usa párrafos cortos para facilitar la lectura</li>
            <li>• Revisa la ortografía y gramática antes de publicar</li>
            <li>• El contenido debe tener al menos 100 caracteres</li>
            <li>• Puedes usar hasta 50,000 caracteres por capítulo</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
