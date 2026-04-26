/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/treinos/novo-recorrente/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

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

const schema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  diasSemana: z.array(z.number()).min(1, "Selecione pelo menos um dia"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  local: z.string().min(1, "Local obrigatório"),
  funcionarioTreinadorId: z.string().min(1, "Treinador obrigatório"),
  descricao: z.string().optional(),
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

const NovoTreinoRecorrentePage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { diasSemana: [] }
  });

  // Busca treinadores com tratamento seguro
  const { data: treinadoresResponse, isLoading: isLoadingTreinadores } = useQuery({
    queryKey: ["funcionarios-treinadores"],
    queryFn: async () => {
      const res = await api.get("/tenant/funcionarios-treinadores");
      return res.data;
    },
  });

  // Normaliza o retorno (pode vir como array direto ou { data: [] })
  const treinadores = Array.isArray(treinadoresResponse) 
    ? treinadoresResponse 
    : treinadoresResponse?.data || [];

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/tenant/treinos-recorrentes", data);
      toast.success("Treino recorrente criado com sucesso!");
      router.push("/treinos");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao criar treino recorrente");
    }
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
          <h1 className="text-3xl font-bold">Novo Treino Recorrente</h1>
          <p className="text-gray-600">Defina dias da semana para repetição automática</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Treino Recorrente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input placeholder="Técnica Individual Sub-9" {...register("nome")} />
              {errors.nome && <p className="text-red-600 text-sm">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
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
              </div>

              <div className="space-y-2">
                <Label>Local *</Label>
                <Input placeholder="Quadra Principal" {...register("local")} />
              </div>
            </div>

            {/* Dias da Semana - Multi Seleção */}
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
              {errors.diasSemana && <p className="text-red-600 text-sm">{errors.diasSemana.message}</p>}
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
              <Label>Treinador *</Label>
              <Select onValueChange={(v) => setValue("funcionarioTreinadorId", v)} disabled={isLoadingTreinadores}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingTreinadores ? "Carregando treinadores..." : "Selecione o treinador"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {treinadores.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funcionarioTreinadorId && <p className="text-red-600 text-sm">{errors.funcionarioTreinadorId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea {...register("descricao")} rows={4} />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Treino Recorrente
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

export default NovoTreinoRecorrentePage;