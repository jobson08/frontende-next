/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, AlertCircle } from "lucide-react";
import api from "@/src/lib/api";

// Schema Zod (igual ao de criação)
const editTreinoSchema = z.object({
  nome: z.string().min(3, "Nome do treino obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  data: z.string().min(1, "Data obrigatória"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  funcionarioTreinadorId: z.string().min(1, "Funcionário treinador obrigatório"),
  local: z.string().min(1, "Local obrigatório"),
  descricao: z.string().optional(),
});

type EditTreinoFormData = z.infer<typeof editTreinoSchema>;

const EditarTreinoPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTreinoFormData>({
    resolver: zodResolver(editTreinoSchema),
  });

  // Busca o treino por ID
  const { 
    data: treino, 
    isLoading: isLoadingTreino, 
    error: treinoError 
  } = useQuery<EditTreinoFormData & { id: string }>({
    queryKey: ["treinos-futebol", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinos-futebol/${id}`);
      const raw = res.data.data;

      // Formata para o form (data como string YYYY-MM-DD)
      return {
        ...raw,
        data: raw.data.split('T')[0], // remove hora/fuso
        funcionarioTreinadorId: raw.funcionarioTreinadorId,
      };
    },
    enabled: !!id,
  });

  // Busca dinâmica de funcionários treinadores
  const { 
    data: treinadores = [], 
    isLoading: isLoadingTreinadores 
  } = useQuery({
    queryKey: ["funcionarios-treinadores"],
    queryFn: async () => {
      const res = await api.get("/tenant/funcionarios-treinadores");
      return res.data.data || [];
    },
  });

  // Preenche o form quando o treino carregar
  useEffect(() => {
    if (treino) {
      reset({
        nome: treino.nome,
        categoria: treino.categoria,
        data: treino.data,
        horaInicio: treino.horaInicio,
        horaFim: treino.horaFim,
        funcionarioTreinadorId: treino.funcionarioTreinadorId,
        local: treino.local,
        descricao: treino.descricao || "",
      });
    }
  }, [treino, reset]);

  const onSubmit = async (data: EditTreinoFormData) => {
    try {
      await api.put(`/tenant/treinos-futebol/${id}`, data);
      toast.success("Treino atualizado com sucesso!");
      router.push(`/treinos/${id}`);
    } catch (err: any) {
      const errorResponse = err.response?.data;
      let errorMsg = "Erro ao atualizar treino";

      if (errorResponse?.details) {
        errorMsg += `: ${errorResponse.details.map((d: any) => d.message).join(', ')}`;
      } else if (errorResponse?.error) {
        errorMsg += `: ${errorResponse.error}`;
      }

      toast.error(errorMsg);
    }
  };

  if (isLoadingTreino || isLoadingTreinadores) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando dados do treino...</span>
      </div>
    );
  }

  if (treinoError || !treino) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erro ao carregar treino</h2>
        <p className="mt-2">{(treinoError as Error)?.message || "Treino não encontrado ou acesso negado"}</p>
        <Button asChild className="mt-6">
          <Link href="/treinos">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/treinos/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Treino</h1>
          <p className="text-gray-600">Atualize as informações de {treino.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Treino</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Controller
                name="categoria"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sub-9">Sub-9</SelectItem>
                      <SelectItem value="Sub-11">Sub-11</SelectItem>
                      <SelectItem value="Sub-13">Sub-13</SelectItem>
                      <SelectItem value="Sub-15">Sub-15</SelectItem>
                      <SelectItem value="Sub-17">Sub-17</SelectItem>
                      <SelectItem value="Adulto">Adulto</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label>Data do Treino *</Label>
              <Input type="date" {...register("data")} />
              {errors.data && <p className="text-sm text-red-600">{errors.data.message}</p>}
            </div>

            {/* Horários */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Hora Início *</Label>
                <Input type="time" {...register("horaInicio")} />
                {errors.horaInicio && <p className="text-sm text-red-600">{errors.horaInicio.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Hora Fim *</Label>
                <Input type="time" {...register("horaFim")} />
                {errors.horaFim && <p className="text-sm text-red-600">{errors.horaFim.message}</p>}
              </div>
            </div>

            {/* Funcionário Treinador - carregado dinamicamente */}
            <div className="space-y-2">
              <Label>Funcionário Treinador *</Label>
              <Controller
                name="funcionarioTreinadorId"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={treinadores.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        treinadores.length === 0 
                          ? "Nenhum treinador cadastrado" 
                          : "Selecione o funcionário treinador"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {treinadores.map((t: { id: string; nome: string }) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.funcionarioTreinadorId && (
                <p className="text-sm text-red-600">{errors.funcionarioTreinadorId.message}</p>
              )}
            </div>

            {/* Local */}
            <div className="space-y-2">
              <Label>Local *</Label>
              <Input placeholder="Quadra Principal" {...register("local")} />
              {errors.local && <p className="text-sm text-red-600">{errors.local.message}</p>}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                className="resize-none"
                rows={5}
                {...register("descricao")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/treinos/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarTreinoPage;