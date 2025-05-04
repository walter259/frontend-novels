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
import { Input } from "@/components/ui/input";
import { RegisterSchema } from "@/lib/validators/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser } from "@/service/auth/authService";
import { useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      user: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterSchema>) => {
    setIsLoading(true);
    try {
      await registerUser(values); 
      toast.success("Registro exitoso");
      router.push("/novels");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorDetails = error.response?.data?.errors || {};
      if (errorDetails.user && errorDetails.user[0]) {
        form.setError("user", {
          type: "server",
          message: "El nombre de usuario ya está siendo usado.",
        });
      }
      if (errorDetails.email && errorDetails.email[0]) {
        form.setError("email", {
          type: "server",
          message: "El email ya está siendo usado.",
        });
      }
      
      toast.error("Error al registrar");
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        id="register-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem]"
      >
        <div className="flex justify-between gap-4">
          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu nombre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre de usuario */}
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Nombre de usuario</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu nombre de usuario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Ingresa tu correo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contraseña */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
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
                  placeholder="Confirma tu contraseña"
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
          {isLoading ? "Cargando..." : "Registrarse"}
        </Button>
      </form>
    </Form>
  );
}