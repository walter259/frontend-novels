"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/lib/validators/reset-password";

import { useState } from "react";
import { updatePassword } from "@/service/auth/authService"; // Importa la función updatePassword

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: token || "",
      email: email || "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    setIsLoading(true); // Activa el estado de carga
    try {
      const response = await updatePassword(values); // Usa la función de authService
      console.log("Contraseña restablecida:", response);
      toast.success("Contraseña restablecida exitosamente.");
      // No despachamos login aquí porque updatePassword no devuelve un nuevo user
      setTimeout(() => router.push("/login"), 1500); // Retraso para que el usuario vea el toast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error al restablecer la contraseña.");
      console.log("Error detallado:", error);
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  if (!token || !email) {
    return <div>Error: Token o email no encontrado en la URL.</div>;
  }

  return (
    <Form {...form}>
      <form
        id="reset-password-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem]"
      >
        {/* Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirmar contraseña */}
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirma tu nueva contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botón de enviar con estado de carga */}
        <Button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-black/90"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "RESTABLECER CONTRASEÑA"}
        </Button>
      </form>
    </Form>
  );
}