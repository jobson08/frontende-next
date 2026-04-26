/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/treinos/recorrentes/[id]/editar/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import api from "@/src/lib/api";
import React from "react";

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  diasSemana: z.array(z.number()).min(1, "Selecione pelo menos um dia"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  local: z.string().min(1, "Local obrigatório"),
  funcionarioTreinadorId: z.string().min(1, "Treinador obrigatório"),
  descricao: z.string().optional(),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const diasSemanaOptions = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

const EditarTreinoRecorrentePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Busca dados do treino recorrente
  const { data: treino, isLoading: loadingTreino } = useQuery({
    queryKey: ["treino-recorrente", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/treinos-recorrentes/${id}`);
      return res.data.data || res.data;
    },
  });

  // Busca treinadores
  const { data: treinadoresResponse, isLoading: isLoadingTreinadores } = useQuery({
    queryKey: ["funcionarios-treinadores"],
    queryFn: async () => {
      const res = await api.get("/tenant/funcionarios-treinadores");
      return res.data;
    },
  });

  // Normaliza treinadores (pode vir como array ou { data: [] })
  const treinadores = Array.isArray(treinadoresResponse)
    ? treinadoresResponse
    : treinadoresResponse?.data || [];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      diasSemana: [],
      ativo: true,
    },
  });

  // Preenche formulário quando dados chegam
  React.useEffect(() => {
    if (treino) {
      setValue("nome", treino.nome);
      setValue("categoria", treino.categoria);
      setValue("diasSemana", treino.diasSemana || []);
      setValue("horaInicio", treino.horaInicio);
      setValue("horaFim", treino.horaFim);
      setValue("local", treino.local);
      setValue("funcionarioTreinadorId", treino.funcionarioTreinadorId);
      setValue("descricao", treino.descricao || "");
      setValue("ativo", treino.ativo);
    }
  }, [treino, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await api.put(`/tenant/treinos-recorrentes/${id}`, data);
      toast.success("Treino recorrente atualizado com sucesso!");
      router.push("/treinos");
      queryClient.invalidateQueries({ queryKey: ["treinos-recorrentes"] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao atualizar treino");
    }
  };

  if (loadingTreino) {
    return <div className="text-center py-20">Carregando dados...</div>;
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/treinos">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Treino Recorrente</h1>
          <p className="text-gray-600">Modifique os dias e horários</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Treino Recorrente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input {...register("nome")} />
              {errors.nome && <p className="text-red-600 text-sm">{errors.nome.message}</p>}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select onValueChange={(v) => setValue("categoria", v)} defaultValue={treino?.categoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Sub-9", "Sub-11", "Sub-13", "Sub-15", "Sub-17", "Adulto"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dias da Semana */}
            <div className="space-y-3">
              <Label>Dias da Semana *</Label>
              <div className="grid grid-cols-2 gap-3">
                {diasSemanaOptions.map((dia) => (
                  <label key={dia.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={watch("diasSemana")?.includes(dia.value)}
                      onCheckedChange={(checked) => {
                        const current = watch("diasSemana") || [];
                        if (checked) {
                          setValue("diasSemana", [...current, dia.value]);
                        } else {
                          setValue("diasSemana", current.filter(d => d !== dia.value));
                        }
                      }}
                    />
                    {dia.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Horários */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Hora Início *</Label>
                <Input type="time" {...register("horaInicio")} />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim *</Label>
                <Input type="time" {...register("horaFim")} />
              </div>
            </div>

            {/* Treinador */}
            <div className="space-y-2">
              <Label>Treinador *</Label>
              <Select onValueChange={(v) => setValue("funcionarioTreinadorId", v)} defaultValue={treino?.funcionarioTreinadorId}>
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
            </div>

            {/* Local */}
            <div className="space-y-2">
              <Label>Local *</Label>
              <Input {...register("local")} />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea {...register("descricao")} rows={4} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={watch("ativo")}
                onCheckedChange={(checked) => setValue("ativo", !!checked)}
              />
              <Label>Treino Ativo</Label>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
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
                <Link href="/treinos">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarTreinoRecorrentePage;