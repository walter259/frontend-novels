"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";

import api from "@/service/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2, ImagePlus, AlertCircle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  updateNovelAsync,
  getNovelByIdAsync,
} from "@/service/novels/novelsService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { NovelFormSchema } from "@/lib/validators/novel";

// Esquema de validación para el formulario de actualización

type UpdateNovelFormValues = z.infer<typeof NovelFormSchema>;

interface NovelUpdateFormProps {
  novelId: string;
}

const NovelUpdateForm = ({ novelId }: NovelUpdateFormProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingNovel, setIsLoadingNovel] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  // Configurar react-hook-form con zod
  const form = useForm<UpdateNovelFormValues>({
    resolver: zodResolver(NovelFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Cargar datos de la novela y categorías al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías
        const categoriesResponse = await api.get("/categories");
        setCategories(categoriesResponse.data.categories || []);
        setIsLoadingCategories(false);

        // Cargar datos de la novela
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const novel = await dispatch(getNovelByIdAsync(novelId) as any);

        if (novel) {
          form.setValue("title", novel.title);
          form.setValue("description", novel.description);
          form.setValue("category_id", novel.category_id.toString());

          if (novel.image) {
            setCurrentImage(novel.image);
          }
        }

        setIsLoadingNovel(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("No se pudieron cargar los datos de la novela");
        setIsLoadingCategories(false);
        setIsLoadingNovel(false);
      }
    };

    fetchData();
  }, [novelId, dispatch, form]);

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(false);
    setImageLoaded(false);
    setRemoveCurrentImage(false);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tamaño de archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }

      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error("El archivo seleccionado no es una imagen válida.");
        return;
      }

      setImageFile(file);
      form.setValue("image", file);

      // Crear preview de la imagen
      const reader = new FileReader();

      reader.onloadend = () => {
        try {
          if (typeof reader.result === "string") {
            setImagePreview(reader.result);
          } else {
            setImageError(true);
            toast.error("No se pudo generar la vista previa de la imagen");
          }
        } catch (error) {
          console.error("Error al procesar vista previa:", error);
          setImageError(true);
        }
      };

      reader.onerror = () => {
        console.error("Error al leer el archivo");
        setImageError(true);
        toast.error("Error al leer la imagen");
      };

      try {
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error al iniciar lectura de archivo:", error);
        setImageError(true);
      }
    }
  };

  // Remover imagen actual
  const handleRemoveCurrentImage = () => {
    setRemoveCurrentImage(true);
    setCurrentImage(null);
  };

  // Remover nueva imagen seleccionada
  const handleRemoveNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(false);
    form.setValue("image", undefined);
    // Reset file input
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Manejar error en la carga de imagen
  const handleImageLoadError = () => {
    setImageError(true);
    setImageLoaded(false);
    console.error("Error al cargar la vista previa de la imagen");
  };

  // Manejar carga exitosa de imagen
  const handleImageLoadSuccess = () => {
    setImageLoaded(true);
  };

  // Enviar formulario
  const onSubmit = async (values: UpdateNovelFormValues) => {
    try {
      if (imageError) {
        toast.error(
          "Hay un problema con la imagen seleccionada. Por favor, selecciona otra imagen."
        );
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        title: values.title,
        description: values.description,
        category_id: parseInt(values.category_id),
      };

      // Solo incluir imagen si se seleccionó una nueva
      if (imageFile) {
        updateData.image = imageFile;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await dispatch(updateNovelAsync(novelId, updateData) as any);

      toast.success("La novela ha sido actualizada correctamente");

      // Redirigir a la página de detalles o principal
      router.push(`/book/${novelId}`);
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar la novela:", error);
      toast.error(
        "No se pudo actualizar la novela. Por favor intenta nuevamente"
      );
    }
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoadingNovel || isLoadingCategories) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando datos de la novela...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Actualizar Novela</CardTitle>
        <CardDescription>
          Modifica los datos de la novela existente
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingresa el título de tu novela"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe una breve sinopsis de tu historia"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoría */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Imagen */}
            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Portada</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center space-y-4">
                      {imageError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Error al cargar la imagen. Por favor, intenta con
                            otra imagen.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Imagen actual */}
                      {currentImage && !removeCurrentImage && !imagePreview && (
                        <div className="relative w-full max-w-xs">
                          <Badge
                            className="absolute -top-2 -left-2 z-10"
                            variant="secondary"
                          >
                            Imagen actual
                          </Badge>
                          <div className="relative h-48 rounded-md overflow-hidden">
                            <Image
                              src={currentImage}
                              alt="Imagen actual"
                              fill
                              style={{ objectFit: "cover" }}
                              className="rounded-md"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2"
                            onClick={handleRemoveCurrentImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Nueva imagen seleccionada */}
                      {imagePreview && !imageError && (
                        <div className="relative w-full max-w-xs">
                          <Badge
                            className="absolute -top-2 -left-2 z-10"
                            variant="default"
                          >
                            Nueva imagen
                          </Badge>
                          <div className="relative h-48 rounded-md overflow-hidden">
                            {!imageLoaded && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            )}
                            <Image
                              src={imagePreview}
                              alt="Vista previa"
                              fill
                              style={{ objectFit: "cover" }}
                              onError={handleImageLoadError}
                              onLoad={handleImageLoadSuccess}
                              className={`rounded-md ${
                                imageLoaded ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2"
                            onClick={handleRemoveNewImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Upload área */}
                      <div className="w-full">
                        <label
                          htmlFor="image"
                          className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <ImagePlus className="h-8 w-8 text-gray-400" />
                            <span className="text-sm font-medium">
                              {imageFile
                                ? "Cambiar imagen"
                                : currentImage
                                ? "Cambiar portada"
                                : "Subir imagen"}
                            </span>
                          </div>
                        </label>
                        <Input
                          id="image"
                          type="file"
                          onChange={handleImageChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || imageError}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Novela"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default NovelUpdateForm;
