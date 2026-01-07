// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, Loader2 } from "lucide-react";

// Schema de login
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Tipo da resposta do backend
interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    tenantId: string | null;
    img: string | null;
    escolinha: {
      id: string;
      nome: string;
      logoUrl: string | null;
    } | null;
  };
}

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao fazer login");
      }

      const result: LoginResponse = await res.json();

      // Salva token e usuário
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login realizado com sucesso!", {
        description: `Bem-vindo, ${result.user.name || result.user.email}!`,
      });

      // Redireciona por role
      switch (result.user.role) {
        case "SUPERADMIN":
          router.push("/superadmin");
          break;
        case "ADMIN":
          router.push("/dashboard");
          break;
        case "TREINADOR":
          router.push("/dashboard/treinador");
          break;
        case "RESPONSAVEL":
          router.push("/dashboarduser/responsavel-dashboard");
          break;
        case "ALUNO_FUTEBOL":
          router.push("/dashboarduser/aluno-dashboard");
          break;
        case "ALUNO_CROSSFIT":
          router.push("/dashboarduser/crossfit-dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (error: unknown) {
      let message = "Erro ao fazer login";
      if (error instanceof Error) {
        message = error.message;
      } else if (error instanceof z.ZodError) {
        message = error.issues.map(issue => issue.message).join(", ");
      }

      toast.error("E-mail ou senha inválidos", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-lg">
            Acesse sua conta FutElite
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-12 h-12"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-12"
                  {...register("password")}
                />
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Não tem acesso? Peça ao administrador da sua escolinha
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;