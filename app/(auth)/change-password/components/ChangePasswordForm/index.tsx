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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { changePassword } from "@/service/auth/authService";
import { changePasswordSchema } from "@/lib/validators/change-password";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    setIsLoading(true);
    try {
      console.log("Datos enviados al backend:", values);
      await changePassword(values);
      toast.success("Contraseña cambiada exitosamente.");
      setTimeout(() => router.push("/account"), 1500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorDetails = error.response?.data?.errors || {};
      if (errorDetails.current_password && errorDetails.current_password[0]) {
        form.setError("current_password", {
          type: "server",
          message: errorDetails.current_password[0],
        });
      }
      if (errorDetails.new_password && errorDetails.new_password[0]) {
        form.setError("new_password", {
          type: "server",
          message: errorDetails.new_password[0],
        });
      }
      if (errorDetails.new_password_confirmation && errorDetails.new_password_confirmation[0]) {
        form.setError("new_password_confirmation", {
          type: "server",
          message: errorDetails.new_password_confirmation[0],
        });
      }
      toast.error("Error al cambiar la contraseña.");
      console.log("Error detallado:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id="change-password-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem] max-w-md mx-auto"
      >
        {/* Contraseña Actual */}
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña Actual</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Ingresa tu contraseña actual" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Nueva Contraseña */}
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Ingresa tu nueva contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirmar Nueva Contraseña */}
        <FormField
          control={form.control}
          name="new_password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirma tu nueva contraseña" {...field} />
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
          {isLoading ? "Cargando..." : "Cambiar Contraseña"}
        </Button>
      </form>
    </Form>
  );
}