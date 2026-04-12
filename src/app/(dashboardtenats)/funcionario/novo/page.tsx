/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ChevronLeft, Loader2, Mail, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";
import InputTelefone from "@/src/components/common/InputTelefone";
import { useApiMutation } from "@/src/hooks/useApiMutation";
import { Toaster } from "@/src/components/ui/sonner";

// Schema Zod
const novoFuncionarioSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  cargo: z.enum(["PROFESSOR", "RECEPCAO", "ADMINISTRATIVO", "TREINADOR", "GERENTE"], {
    message: "Cargo inválido",
  }),
  salario: z.number().positive("Salário deve ser positivo").optional(),
  observacoes: z.string().optional(),
  email: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
});

type FormData = z.infer<typeof novoFuncionarioSchema>;

// Função para gerar senha aleatória
function gerarSenhaAleatoria(tamanho = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  let senha = "";
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

const NovoFuncionarioPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(novoFuncionarioSchema),
    defaultValues: {
      cargo: "TREINADOR",
    },
  });

  // Mutation usando o hook reutilizável
  const createMutation = useApiMutation(
    async (data: FormData) => {
      const senhaGerada = gerarSenhaAleatoria(12);

      const payload = {
        nome: data.nome.trim(),
        telefone: data.telefone,
        cargo: data.cargo,
        salario: data.salario,
        observacoes: data.observacoes,
        email: data.email.toLowerCase().trim(),
        password: senhaGerada,
      };

      return api.post("/tenant/funcionarios", payload);
    },
    {
      successMessage: "Funcionário criado com sucesso!",
      invalidateQueries: ["funcionarios"],
      onSuccessCallback: () => {
        // Redireciona após sucesso
        setTimeout(() => router.push("/funcionario"), 1800);
      },
    }
  );

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/funcionario">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Funcionário</h1>
          <p className="text-gray-600">Preencha os dados do funcionário</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Dados do Funcionário
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" placeholder="Lucas Silva Santos" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Controller
                name="cargo"
                control={control}
                render={({ field }) => (
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
                )}
              />
              {errors.cargo && <p className="text-sm text-red-600">{errors.cargo.message}</p>}
            </div>

            {/* Salário */}
            <div className="space-y-2">
              <Label htmlFor="salario">Salário (opcional)</Label>
              <Input
                id="salario"
                type="number"
                step="0.01"
                placeholder="3500.00"
                {...register("salario", { valueAsNumber: true })}
              />
              {errors.salario && <p className="text-sm text-red-600">{errors.salario.message}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <InputTelefone id="telefone" placeholder="(81) 99999-8888" {...register("telefone")} />
              {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="funcionario@escolinha.com"
                  className="pl-12"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              <p className="text-xs text-gray-500">
                O login será criado automaticamente com senha gerada.
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Horário de trabalho, especialidade, etc..."
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando funcionário...
                  </>
                ) : (
                  "Criar Funcionário"
                )}
              </Button>

              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/funcionario">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default NovoFuncionarioPage;