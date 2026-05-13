/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinos/novo/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Loader2, ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import api from "@/src/lib/api";

const schema = z.object({
  nome: z.string().min(3, "Nome do treino é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora de início inválida (HH:mm)"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Hora de fim inválida (HH:mm)"),
  treinadorId: z.string().min(1, "Treinador é obrigatório"),
  local: z.string().min(1, "Local é obrigatório"),
  descricao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const NovoTreinoPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Busca de Treinadores
  const { data: treinadores = [], isLoading: loadingTreinadores } = useQuery({
    queryKey: ["treinadores"],
    queryFn: async () => {
      const res = await api.get("/tenant/treinadores");
      return res.data.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post("/tenant/treinos", data);
      return res.data;
    },

    onSuccess: (response) => {
      toast.success(response.message || "Treino criado com sucesso!", {
        description: "O treino foi agendado com sucesso.",
        duration: 5000,
      });
      router.push("/treinos");
    },

    onError: (err: any) => {
      const errorMsg = err.response?.data?.error 
                    || err.response?.data?.message 
                    || err.message 
                    || "Erro ao criar treino";

      toast.error(errorMsg, {
        description: "Verifique os dados e tente novamente.",
        duration: 6000,
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/treinos">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Treino</h1>
          <p className="text-gray-600">Crie um novo treino para a escolinha</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Treino por Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input placeholder="Ex: Técnica Individual Sub-11" {...register("nome")} />
              {errors.nome && <p className="text-red-600 text-sm">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select onValueChange={(v) => setValue("categoria", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && <p className="text-red-600 text-sm">{errors.categoria.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Data do Treino *</Label>
                <Input type="date" {...register("data")} />
                {errors.data && <p className="text-red-600 text-sm">{errors.data.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Hora Início *</Label>
                <Input type="time" {...register("horaInicio")} />
                {errors.horaInicio && <p className="text-red-600 text-sm">{errors.horaInicio.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Hora Fim *</Label>
                <Input type="time" {...register("horaFim")} />
                {errors.horaFim && <p className="text-red-600 text-sm">{errors.horaFim.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Treinador Responsável *</Label>
              <Select onValueChange={(v) => setValue("treinadorId", v)} disabled={loadingTreinadores}>
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
              {errors.treinadorId && <p className="text-red-600 text-sm">{errors.treinadorId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Local *</Label>
              <Input placeholder="Quadra Principal" {...register("local")} />
              {errors.local && <p className="text-red-600 text-sm">{errors.local.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea {...register("descricao")} rows={4} />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Treino...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Treino
                  </>
                )}
              </Button>

              <Button variant="outline" asChild>
                <Link href="/treinos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default NovoTreinoPage;