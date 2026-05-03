/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinador/configuracoes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import api from "@/src/lib/api";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Eye, EyeOff } from "lucide-react";


const schema = z.object({
 email: z.string().email("E-mail inválido"),
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres").optional(),
});

type FormData = z.infer<typeof schema>;

const TreinadorConfiguracoesPage = () => {
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  const { data: treinador, isLoading } = useQuery({
    queryKey: ["treinador", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      console.log("🔍 Dados do treinador:", res.data);
      return res.data;
    },
  });

 const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return api.put("/tenant/treinadores/configuracoes", data);
    },
  onSuccess: (response) => {
    // ✅ Captura a mensagem que vem do backend
    const message = response.data?.message || "Alterações realizadas com sucesso!";
    
      toast.success(message, {
        description: "Suas informações foram atualizadas.",
      });
      reset({ email: treinador?.email || "", senhaAtual: "", novaSenha: "" }); // Limpa os campos de senha
    },
    onError: (err: any) => {
        // ✅ Captura a mensagem de erro do backend
        const errorMessage = err.response?.data?.error 
        || err.response?.data?.message 
        || err.message 
        || "Erro ao atualizar configurações";

        toast.error(errorMessage, {
        description: "Verifique os dados e tente novamente.",
        duration: 6000,
        });

        console.error("❌ Erro completo:", err.response?.data || err);
    },
  });

 const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Minhas Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-28 w-28">
              <AvatarImage src={treinador?.fotoUrl} />
              <AvatarFallback className="text-4xl bg-linear-to-br from-blue-600 to-purple-600 text-white">
                {treinador?.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{treinador?.name}</h2>
              <p className="text-gray-600">{treinador?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Novo E-mail</Label>
              <Input type="email" defaultValue={treinador?.email} {...register("email")} />
            </div>

            <div className="space-y-2">
              <Label>Senha Atual</Label>
              <div className="relative">
                <Input type={showSenhaAtual ? "text" : "password"} {...register("senhaAtual")} />
                <button type="button" onClick={() => setShowSenhaAtual(!showSenhaAtual)} className="absolute right-3 top-3">
                  {showSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input type={showNovaSenha ? "text" : "password"} {...register("novaSenha")} />
                <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)} className="absolute right-3 top-3">
                  {showNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Alterando..." : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
        <Toaster position="top-right" richColors closeButton duration={5000} />
    </div>
    
  );
};

export default TreinadorConfiguracoesPage;