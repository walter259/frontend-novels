"use client";

import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { useEffect } from "react";

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
import { Loader2, ArrowLeft, Save, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateChapterAsync } from "@/service/chapter/chapterService";
import { ChapterUpdateSchema } from "@/lib/validators/chapertUpdate";
import { formatText } from "@/lib/utils/textFormatter";

interface ChapterUpdateFormProps {
  novelId: string;
  chapterId: string;
  novelTitle?: string;
  currentChapter: Chapter;
}

type ChapterUpdateFormData = z.infer<typeof ChapterUpdateSchema>;

export default function ChapterUpdateForm({
  novelId,
  chapterId,
  novelTitle,
  currentChapter,
}: ChapterUpdateFormProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<ChapterUpdateFormData>({
    resolver: zodResolver(ChapterUpdateSchema),
    defaultValues: {
      title: currentChapter.title || "",
      content: currentChapter.content || "",
      chapter_number: currentChapter.chapter_number || 1,
    },
  });

  const {
    watch,
    formState: { isSubmitting, isDirty },
  } = form;
  const contentValue = watch("content");
  const titleValue = watch("title");
  const charCount = contentValue?.length || 0;

  // Establecer valores iniciales cuando el capítulo cambie
  useEffect(() => {
    if (currentChapter) {
      form.reset({
        title: currentChapter.title || "",
        content: currentChapter.content || "",
        chapter_number: currentChapter.chapter_number || 1,
      });
    }
  }, [currentChapter, form]);

  const onSubmit = async (values: ChapterUpdateFormData) => {
    try {
      console.log("Actualizando capítulo:", values);

      const updateData = {
        title: values.title,
        content: values.content,
        chapter_number: values.chapter_number,
      };

      await dispatch(
        updateChapterAsync(Number(novelId), Number(chapterId), updateData)
      );

      toast.success("Capítulo actualizado exitosamente", {
        position: "top-right",
      });

      // Redirigir a la página del capítulo o de la novela
      router.push(`/book/${novelId}`);
    } catch (error) {
      console.error("Error al actualizar capítulo:", error);
      toast.error("Error al actualizar el capítulo. Inténtalo de nuevo.");
    }
  };

  const handleCancel = () => {
    if (isDirty) {
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

  const handleFormatText = () => {
    const currentContent = form.getValues("content");
    if (currentContent) {
      const formattedContent = formatText(currentContent);
      form.setValue("content", formattedContent);
      toast.success("Texto formateado correctamente");
    } else {
      toast.warning("No hay contenido para formatear");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold mb-2">Editar Capítulo</h1>
        {novelTitle && (
          <p className="text-muted-foreground">
            Novela: <span className="font-semibold">{novelTitle}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Capítulo #{currentChapter.chapter_number}
        </p>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Capítulo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campo Número de Capítulo */}
              <FormField
                control={form.control}
                name="chapter_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Capítulo *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <FormLabel className="flex items-center justify-between">
                      Contenido del Capítulo *
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleFormatText}
                        disabled={isSubmitting || !contentValue}
                        className="ml-2"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Formatear
                      </Button>
                    </FormLabel>
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
                  disabled={isSubmitting || !isDirty}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
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

              {!isDirty && (
                <p className="text-sm text-muted-foreground text-center">
                  No hay cambios para guardar
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Consejos para editar:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Revisa cuidadosamente los cambios antes de guardar</li>
            <li>• Usa párrafos cortos para facilitar la lectura</li>
            <li>• Verifica la ortografía y gramática</li>
            <li>• El contenido debe tener al menos 100 caracteres</li>
            <li>• Puedes cambiar el número de capítulo si es necesario</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
