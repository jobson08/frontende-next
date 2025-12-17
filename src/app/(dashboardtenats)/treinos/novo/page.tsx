// src/app/(dashboard)/treinos/novo/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

const novoTreinoSchema = z.object({
  nome: z.string().min(3, "Nome do treino obrigatório"),
  categoria: z.string(),
  diaSemana: z.enum(["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]),
  hora: z.string(),
  treinador: z.string(),
  alunosMax: z.number().min(1).max(30),
  descricao: z.string().optional(),
});

type NovoTreinoFormData = z.infer<typeof novoTreinoSchema>;

const NovoTreinoPage = () => {      //Inicio da função

    const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NovoTreinoFormData>({
    resolver: zodResolver(novoTreinoSchema),
  });

  const onSubmit = async (data: NovoTreinoFormData) => {
    try {
      console.log("Novo treino:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Treino criado com sucesso!");
    } catch {
      toast.error("Erro ao criar treino");
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
            <div className="space-y-2">
              <Label>Nome do Treino *</Label>
              <Input placeholder="Ex: Técnica Individual Sub-11" {...register("nome")} />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
            <Label>Categoria *</Label>
            <Controller
                name="categoria"
                control={control}
                rules={{ required: "Categoria obrigatória" }}
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
                    </SelectContent>
                </Select>
                )}
            />
            {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Input type="time" {...register("hora")} />
              </div>
            {/* Treinador */}
            <div className="space-y-2">
            <Label>Treinador *</Label>
            <Controller
                name="treinador"
                control={control}
                rules={{ required: "Treinador obrigatório" }}
                render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione o treinador" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Rafael Lima">Rafael Lima</SelectItem>
                    <SelectItem value="Mariana Costa">Mariana Costa</SelectItem>
                    <SelectItem value="Carlos Souza">Carlos Souza</SelectItem>
                    <SelectItem value="Beatriz Oliveira">Beatriz Oliveira</SelectItem>
                    </SelectContent>
                </Select>
                )}
            />
            {errors.treinador && <p className="text-sm text-red-600">{errors.treinador.message}</p>}
            </div>
            </div>

            <div className="space-y-2">
              <Label>Máximo de Alunos *</Label>
              <Input type="number" min="1" max="30" placeholder="20" {...register("alunosMax", { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label>Descrição do Treino (opcional)</Label>
              <Textarea
                placeholder="Descreva os objetivos e exercícios do treino..."
                className="resize-none"
                rows={5}
                {...register("descricao")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
}
 
export default NovoTreinoPage;