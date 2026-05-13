/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinos/[id]/editar/page.tsx
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2, ChevronLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/api";

// Schema Zod (igual ao de criação)
const editTreinoSchema = z.object({
  nome: z.string().min(3, "Nome do treino obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  data: z.string().min(1, "Data obrigatória"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  treinadorId: z.string().min(1, "Treinador obrigatório"),
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
    isLoading: isLoadingTreino 
  } = useQuery({
    queryKey: ["treino", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinos/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Busca treinadores
  const { 
    data: treinadores = [], 
    isLoading: isLoadingTreinadores 
  } = useQuery({
    queryKey: ["treinadores"],
    queryFn: async () => {
      const res = await api.get("/tenant/treinadores");
      return res.data.data || [];
    },
  });

  // Preenche o formulário
  useEffect(() => {
    if (treino) {
      reset({
        nome: treino.nome,
        categoria: treino.categoria,
        data: treino.data.split('T')[0],
        horaInicio: treino.horaInicio,
        horaFim: treino.horaFim,
        treinadorId: treino.treinadorId,
        local: treino.local,
        descricao: treino.descricao || "",
      });
    }
  }, [treino, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditTreinoFormData) => {
      return api.put(`/tenant/treinos/${id}`, data);
    },

    onSuccess: (response) => {
      toast.success(response.data?.message || "Treino atualizado com sucesso!", {
        description: "As alterações foram salvas.",
        duration: 5000,
      });
      router.push(`/treinos/${id}`);
    },

    onError: (err: any) => {
      const errorMsg = err.response?.data?.error 
                    || err.response?.data?.message 
                    || err.message 
                    || "Erro ao atualizar treino";

      toast.error(errorMsg, {
        description: "Verifique os dados e tente novamente.",
        duration: 6000,
      });
    },
  });

  const onSubmit = (data: EditTreinoFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoadingTreino || isLoadingTreinadores) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando dados...</span>
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Treino não encontrado</h2>
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
          <p className="text-gray-600">Atualizando: {treino.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Treino</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input {...register("nome")} />
              {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {["Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Data do Treino *</Label>
                <Input type="date" {...register("data")} />
                {errors.data && <p className="text-sm text-red-600">{errors.data.message}</p>}
              </div>
            </div>

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

            <div className="space-y-2">
              <Label>Treinador Responsável *</Label>
              <Controller
                name="treinadorId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o treinador" />
                    </SelectTrigger>
                    <SelectContent>
                      {treinadores.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.treinadorId && <p className="text-sm text-red-600">{errors.treinadorId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Local *</Label>
              <Input {...register("local")} />
              {errors.local && <p className="text-sm text-red-600">{errors.local.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea rows={5} {...register("descricao")} />
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
                    Salvando Alterações...
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

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default EditarTreinoPage;