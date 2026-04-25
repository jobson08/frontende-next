/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// src/app/login/page.tsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Checkbox } from "@/src/components/ui/checkbox";
import { toast } from "sonner";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

// Schema de login
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  // Carrega email salvo do localStorage (se existir)
  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    if (savedEmail) {
      setValue("email", savedEmail);
      setValue("rememberMe", true); // marca o checkbox se tiver salvo
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);

    try {
      // Salva email se "Lembrar de mim" estiver marcado
      if (data.rememberMe) {
        localStorage.setItem("savedEmail", data.email.trim());
      } else {
        localStorage.removeItem("savedEmail");
      }

      const res = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao fazer login");
      }

      const result = await res.json();

      // Salva token no cookie e localStorage
      document.cookie = `token=${result.token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      toast.success("Login realizado!", {
        description: `Bem-vindo, ${result.user.name || result.user.email}!`,
      });

      // Redireciona por role
      const from = searchParams.get("from");
      let redirectTo = from ? decodeURIComponent(from) : "/superadmin/tenants";

      switch (result.user.role) {
        case "SUPERADMIN":
          redirectTo = from?.includes("/superadmin") ? from : "/superadmin/tenants";
          break;
        case "ADMIN":
          redirectTo = from?.includes("/dashboardtenats") ? from : "/admin";
          break;
        case "FUNCIONARIO":
          redirectTo = from?.includes("/dashboarduser/funcionario-dashboard") ? from : "/dashboarduser/funcionario-dashboard";
          break;
        case "TREINADOR":
          redirectTo = from?.includes("/treinador") ? from : "/treinador";
          break;
        case "RESPONSAVEL":
          redirectTo = from?.includes("/dashboarduser/responsavel-dashboard") ? from : "/dashboarduser/responsavel-dashboard";
          break;
        case "ALUNO_FUTEBOL":
          redirectTo = from?.includes("/dashboarduser/aluno-futebol") ? from : "/dashboarduser/aluno-futebol";
          break;
        case "ALUNO_CROSSFIT":
          redirectTo = from?.includes("/dashboarduser/aluno-crossfit") ? from : "/dashboarduser/aluno-crossfit";
          break;
        default:
          redirectTo = "/dashboard";
      }

      // Força reload completo para cookie ser processado
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 1500);

    } catch (error) {
      toast.error("Erro no login", {
        description: (error as Error).message,
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
            {/* E-mail */}
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

            {/* Senha com opção de mostrar/esconder */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-12 pr-12 h-12"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Checkbox "Lembrar de mim" */}
            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" {...register("rememberMe")} />
              <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                Lembrar de mim
              </Label>
            </div>

            {/* Botão de login */}
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