import { z } from "zod";

export const NovelFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category_id: z.string().min(1, "Debes seleccionar una categoría"),
  image: z.any().optional()
});