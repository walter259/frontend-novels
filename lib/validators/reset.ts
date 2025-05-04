import { z } from "zod";

export const ResetSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido" }).nonempty({ message: "El correo es requerido" }),
});