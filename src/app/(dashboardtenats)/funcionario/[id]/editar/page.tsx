/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import InputTelefone from "@/src/components/common/InputTelefone";

// Schema Zod para edição (campos parciais)
const editFuncionarioSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  telefone: z.string().min(10, "Telefone inválido").optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cargo: z.enum(["PROFESSOR", "RECEPCAO", "ADMINISTRATIVO", "TREINADOR", "GERENTE"]),
  observacoes: z.string().optional(),
});

type EditFuncionarioFormData = z.infer<typeof editFuncionarioSchema>;

const EditarFuncionarioPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: funcionario, isLoading, error } = useQuery({
    queryKey: ["funcionario", id],
    queryFn: async () => {
      const { data } = await api.get(`/tenant/funcionarios/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFuncionarioFormData>({
    resolver: zodResolver(editFuncionarioSchema),
  });

  // Pré-preenche o formulário quando os dados chegam
  useEffect(() => {
    if (funcionario) {
      reset({
        nome: funcionario.nome,
        telefone: funcionario.telefone || "",
        email: funcionario.email || "",
        cargo: funcionario.cargo,
        observacoes: funcionario.observacoes || "",
      });
    }
  }, [funcionario, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditFuncionarioFormData) => {
      const response = await api.put(`/tenant/funcionarios/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Funcionário atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["funcionario", id] });
      queryClient.invalidateQueries({ queryKey: ["funcionarios"] });
      router.push(`/funcionario/${id}`); // volta para detalhes
    },
    onError: (err: any) => {
      console.error("[Editar Funcionário] Erro:", err);
      toast.error("Erro ao atualizar funcionário", {
        description: err.response?.data?.error || "Tente novamente",
      });
    },
  });

  const onSubmit = async (data: EditFuncionarioFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <span className="ml-4 text-xl">Carregando dados...</span>
      </div>
    );
  }

  if (error || !funcionario) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold">Funcionário não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/funcionario">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/funcionarios/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Funcionário</h1>
          <p className="text-gray-600">Atualize as informações de {funcionario.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6 text-orange-600" />
            Editar Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo *</Label>
              <Input id="nome" {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <InputTelefone id="telefone" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input type="email" id="email" {...register("email")} />
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
                {...register("observacoes")}
                rows={4}
                placeholder="Horário, especialidade, observações..."
                className="resize-none"
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || updateMutation.isPending}
                className="flex-1 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isSubmitting || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>

              <Button type="button" variant="outline" asChild>
                <Link href={`/funcionario/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarFuncionarioPage;