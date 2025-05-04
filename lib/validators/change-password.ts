import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "La contraseña actual es requerida"),
    new_password: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres"),
    new_password_confirmation: z.string().min(8, "Confirma tu nueva contraseña"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["new_password_confirmation"],
  });