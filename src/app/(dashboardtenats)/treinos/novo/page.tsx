/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import api from "@/src/lib/api";

// Schema Zod (igual ao backend)
const novoTreinoSchema = z.object({
  nome: z.string().min(3, "Nome do treino obrigatório"),
  categoria: z.string().min(1, "Categoria obrigatória"),
  data: z.string().min(1, "Data obrigatória"),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato inválido (HH:mm)"),
  funcionarioTreinadorId: z.string().min(1, "Funcionário treinador obrigatório"),
  local: z.string().min(1, "Local obrigatório"),
  descricao: z.string().optional(),
});

type NovoTreinoFormData = z.infer<typeof novoTreinoSchema>;

const NovoTreinoPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NovoTreinoFormData>({
    resolver: zodResolver(novoTreinoSchema),
  });

  // Busca dinâmica de funcionários com cargo TREINADOR
  const { data: treinadores = [], isLoading: isLoadingTreinadores } = useQuery({
    queryKey: ["funcionarios-treinadores"],
    queryFn: async () => {
      const res = await api.get("/tenant/funcionarios-treinadores");
      return res.data.data || [];
    },
  });

  const onSubmit = async (data: NovoTreinoFormData) => {
    try {
      const payload = {
        ...data,
        data: data.data, // já vem como "YYYY-MM-DD" do input type="date"
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
      };

      await api.post("/tenant/treinos-futebol", payload);
      toast.success("Treino criado com sucesso!");
      router.push("/treinos"); // ou para a lista de treinos
    } catch (err: any) {
      const errorResponse = err.response?.data;
      let errorMsg = "Erro ao criar treino";

      if (errorResponse?.details) {
        errorMsg += `: ${errorResponse.details.map((d: any) => d.message).join(', ')}`;
      } else if (errorResponse?.error) {
        errorMsg += `: ${errorResponse.error}`;
      }

      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
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
          <CardTitle>Novo Treino</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input placeholder="Ex: Técnica Individual Sub-11" {...register("nome")} />
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
                    disabled={isLoadingTreinadores}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingTreinadores 
                          ? "Carregando treinadores..." 
                          : treinadores.length === 0 
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
                placeholder="Objetivos, exercícios, observações..."
                rows={5}
                {...register("descricao")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingTreinadores} 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
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
    </div>
  );
};

export default NovoTreinoPage;