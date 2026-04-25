/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/dashboarduser/aluno-futebol/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Trophy, Calendar, Target, Star, MessageSquare, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { useParams } from "next/navigation";

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(8, "Nova senha deve ter no mínimo 8 caracteres"),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});


type SenhaFormData = z.infer<typeof senhaSchema>;

const AlunoFutebolPage =() => {
 const [openModalSenha, setOpenModalSenha] = useState(false);

  // Busca dados do aluno logado
  const { data: response, isLoading: alunoLoading, error: alunoError } = useQuery({
    queryKey: ["aluno-futebol-me"],
    queryFn: async () => {
      const res = await api.get("/tenant/aluno-futebol/me");
      console.log("✅ Dados do aluno recebidos:", res.data);
      return res.data; // { success: true, data: { ... } }
    },
  });

  const aluno = response?.data; // ← Aqui está a correção principal

  // Busca próximos treinos
  const { data: proximosTreinosResponse = [] } = useQuery({
    queryKey: ["proximos-treinos"],
    queryFn: async () => {
      const res = await api.get("/tenant/aluno-futebol/proximos-treinos");
      console.log("✅ Próximos treinos recebidos:", res.data);
      return res.data;
    },
    enabled: !!aluno,
  });

  const proximosTreinos = proximosTreinosResponse?.data || proximosTreinosResponse;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
  });

  const onSubmitSenha = async (data: SenhaFormData) => {
    try {
      await api.post("/tenant/aluno-futebol/trocar-senha", data);
      toast.success("Senha alterada com sucesso!");
      reset();
      setOpenModalSenha(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao alterar senha");
    }
  };

  if (alunoLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-xl font-medium text-gray-700">Carregando seu perfil...</p>
      </div>
    );
  }

  if (alunoError || !aluno) {
    return (
      <div className="text-center py-20 text-red-600">
        Erro ao carregar dados do aluno. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 ring-4 ring-green-400">
            <AvatarImage src={aluno.fotoUrl} onError={(e) => e.currentTarget.style.display = 'none'}/>
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-4xl font-bold">
              {aluno.name ? aluno.name.split(" ").map((n: string) => n[0]).join("") : "A"}
            </AvatarFallback>
          </Avatar>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {aluno.name ? aluno.name.split(" ")[0] : "Aluno"}!
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className="bg-green-600 text-white px-4 py-1">
                {aluno.categoria || "Sub-13"}
              </Badge>
              <Badge variant="secondary" className="px-4 py-1">
                {aluno.nivel || "Avançado"}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              {aluno.idade || "?"} anos • {aluno.frequenciaMes || 0} treinos este mês
            </p>
          </div>
        </div>

        {/* Botão Trocar Senha */}
        <Dialog open={openModalSenha} onOpenChange={setOpenModalSenha}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Key className="h-4 w-4" />
              Trocar Senha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Trocar Senha</DialogTitle>
              <DialogDescription>
                Para maior segurança, troque sua senha.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmitSenha)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha atual</Label>
                <Input id="senhaAtual" type="password" {...register("senhaAtual")} />
                {errors.senhaAtual && <p className="text-sm text-red-600">{errors.senhaAtual.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova senha</Label>
                <Input id="novaSenha" type="password" {...register("novaSenha")} />
                {errors.novaSenha && <p className="text-sm text-red-600">{errors.novaSenha.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                <Input id="confirmarSenha" type="password" {...register("confirmarSenha")} />
                {errors.confirmarSenha && <p className="text-sm text-red-600">{errors.confirmarSenha.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Alterando..." : "Alterar Senha"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpenModalSenha(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Treinos esta semana</CardTitle>
            <Trophy className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">4/5</div>
            <p className="text-xs text-gray-500 mt-1">Meta semanal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximos treinos</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{proximosTreinos.length}</div>
            <p className="text-xs text-gray-500 mt-1">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Frequência mensal</CardTitle>
            <Target className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{aluno.frequenciaMes || 0}</div>
            <p className="text-xs text-gray-500 mt-1">treinos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliação</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500">4.8</div>
            <p className="text-xs text-gray-500 mt-1">média dos treinadores</p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Treinos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Treinos</CardTitle>
        </CardHeader>
        <CardContent>
          {proximosTreinos.length > 0 ? (
            <div className="space-y-4">
              {proximosTreinos.map((treino: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{treino.treino}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {treino.dia} • {treino.hora} • {treino.treinador}
                    </p>
                  </div>
                  <Badge>Confirmado</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">Nenhum treino agendado para os próximos dias.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlunoFutebolPage;