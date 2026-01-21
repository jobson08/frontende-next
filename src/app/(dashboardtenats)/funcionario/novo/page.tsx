/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";

// Schema Zod (mantido igual, só ajustei nomes para consistência com schema Prisma)
const novoFuncionarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cargo: z.enum(["PROFESSOR", "RECEPCAO", "ADMINISTRATIVO", "TREINADOR", "GERENTE"]),
  observacoes: z.string().optional(),
});

type NovoFuncionarioFormData = z.infer<typeof novoFuncionarioSchema>;

const NovoFuncionarioPage = () => {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string; // ID da escolinha atual (vem da URL /tenants/[id]/funcionarios/novo)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NovoFuncionarioFormData>({
    resolver: zodResolver(novoFuncionarioSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: NovoFuncionarioFormData) => {
      console.log("[Criar Funcionário] Enviando para escolinha:", tenantId, data);
      const response = await api.post('/tenant/funcionarios', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Funcionário cadastrado com sucesso!", {
        description: "Ele já está na equipe da escolinha.",
      });
      router.push(`/tenants/${tenantId}/funcionarios`); // redireciona para lista
    },
    onError: (err: any) => {
      console.error("[Criar Funcionário] Erro:", err);
      toast.error("Erro ao cadastrar funcionário", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  const onSubmit = async (data: NovoFuncionarioFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/tenants/${tenantId}/funcionarios`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Funcionário</h1>
          <p className="text-gray-600">Adicione um novo membro à equipe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-orange-600" />
            Dados do Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="Mariana Costa" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" placeholder="(81) 99999-8888" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="funcionario@escolinha.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <Controller
              name="cargo"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROFESSOR">Professor</SelectItem>
                      <SelectItem value="RECEPCAO">Recepção</SelectItem>
                      <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                      <SelectItem value="TREINADOR">Treinador</SelectItem>
                      <SelectItem value="GERENTE">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.cargo && <p className="text-sm text-red-600">{errors.cargo.message}</p>}
                </div>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Horário de trabalho, especialidade, etc..."
                className="resize-none"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isSubmitting || createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cadastrar Funcionário
                  </>
                )}
              </Button>

              <Button type="button" variant="outline" asChild>
                <Link href={`/${tenantId}/funcionario`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovoFuncionarioPage;