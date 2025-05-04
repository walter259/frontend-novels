// components/LoginForm.tsx
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
import { LoginSchema } from "@/lib/validators/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { loginUser } from "@/service/auth/authService"; // Importa loginUser

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false, // Añade el campo remember
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema> & { remember?: boolean }) => {
    try {
      console.log("Datos enviados:", values);
      // Determina si el identifier es un email o un nombre de usuario
      const payload = values.identifier.includes("@")
        ? { email: values.identifier, password: values.password }
        : { user: values.identifier, password: values.password };

      // Usa loginUser de authService.ts
      await loginUser(payload.email || payload.user || "", values.password, values.remember || false);
      
      console.log("Inicio de sesión exitoso");
      toast.success("Inicio de sesión exitoso");
      router.push("/novels"); // Cambia "/" por "/novels" para ser consistente con tu app

    } catch (error) {
      toast.error("Usuario o contraseña incorrectos.")
      console.log(error)
    }
  };

  return (
    <Form {...form}>
      <form
        id="login-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 w-[99%] p-[0.3rem]"
      >
        {/* Correo o Nombre de usuario */}
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Correo o Nombre de usuario</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa tu correo o nombre de usuario"
                  {...field}
                />
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
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Recordarme */}
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mr-2"
                />
              </FormControl>
              <FormLabel className="text-sm">Recordarme</FormLabel>
            </FormItem>
          )}
        />

        {/* Botón de enviar */}
        <Button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-black/90"
        >
          Iniciar Sesión
        </Button>
      </form>
    </Form>
  );
}