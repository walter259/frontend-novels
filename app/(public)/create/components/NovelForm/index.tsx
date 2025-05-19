"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Image from "next/image";

import api from "@/service/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Loader2, ImagePlus, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createNovelAsync } from "@/service/novels/novelsService";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Esquema de validación para el formulario
const NovelFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category_id: z.string().min(1, "Debes seleccionar una categoría"),
  image: z.any().optional()
});

type NovelFormValues = z.infer<typeof NovelFormSchema>;

interface Category {
  id: number;
  name: string;
}

const NovelForm = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  // Configurar react-hook-form con zod
  const form = useForm<NovelFormValues>({
    resolver: zodResolver(NovelFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
    },
  });
  
  const isLoading = form.formState.isSubmitting;

  // Cargar categorías al iniciar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
        toast.error("No se pudieron cargar las categorías");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Manejar cambio de imagen con mejor manejo de errores
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(false); // Resetear error al intentar de nuevo
    setImageLoaded(false);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validar tamaño de archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }
      
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error("El archivo seleccionado no es una imagen válida.");
        return;
      }
      
      setImageFile(file);
      form.setValue("image", file);
      
      // Crear preview de la imagen con manejo de errores
      const reader = new FileReader();
      
      reader.onloadend = () => {
        try {
          if (typeof reader.result === 'string') {
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
  const onSubmit = async (values: NovelFormValues) => {
    try {
      if (imageError) {
        toast.error("Hay un problema con la imagen seleccionada. Por favor, selecciona otra imagen.");
        return;
      }
      
      await dispatch(createNovelAsync({
        title: values.title,
        description: values.description,
        category_id: parseInt(values.category_id),
        image: imageFile || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any);

      toast.success("La novela ha sido creada correctamente");

      // Redirigir a la página principal o de detalles
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al crear la novela:", error);
      toast.error("No se pudo crear la novela. Por favor intenta nuevamente");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nueva Novela</CardTitle>
        <CardDescription>
          Completa el formulario para crear una nueva historia
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
                    {isLoadingCategories ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cargando categorías...</span>
                      </div>
                    ) : (
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
                    )}
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
                  <FormLabel>Portada (Opcional)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center space-y-4">
                      {imageError && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Error al cargar la imagen. Por favor, intenta con otra imagen.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {imagePreview && !imageError && (
                        <div className="relative w-full max-w-xs h-48 rounded-md overflow-hidden">
                          {/* Usando Image de Next.js con manejador de errores */}
                          {!imageLoaded && <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>}
                          <Image 
                            src={imagePreview} 
                            alt="Vista previa" 
                            fill
                            style={{ objectFit: 'cover' }}
                            onError={handleImageLoadError}
                            onLoad={handleImageLoadSuccess}
                            className={imageLoaded ? "opacity-100" : "opacity-0"}
                          />
                        </div>
                      )}
                      
                      <div className="w-full">
                        <label 
                          htmlFor="image" 
                          className="cursor-pointer flex items-center justify-center w-full p-4 border-2 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <ImagePlus className="h-8 w-8 text-gray-400" />
                            <span className="text-sm font-medium">
                              {imageFile ? 'Cambiar imagen' : 'Subir imagen'}
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
            <Button 
              type="submit" 
              disabled={isLoading || isLoadingCategories || imageError}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Novela'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default NovelForm;