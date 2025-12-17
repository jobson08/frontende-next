
// src/app/(dashboard)/treinos/[id]/editar/page.tsx
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Loader2 } from "lucide-react";

// Schema (mesmo do novo treino)
const editTreinoSchema = z.object({
  nome: z.string().min(3, "Nome do treino obrigatório"),
  categoria: z.string(),
  diaSemana: z.enum(["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]),
  hora: z.string(),
  treinador: z.string(),
  alunosMax: z.number().min(1).max(30),
  descricao: z.string().optional(),
});

type EditTreinoFormData = z.infer<typeof editTreinoSchema>;

// Mock do treino atual
const treinosMock = [
  {
  id: "1",
    nome: "Técnica Individual Sub-11",
    categoria: "Sub-11",
    diaSemana: "Segunda",
    hora: "18:00",
    treinador: "Rafael Lima",
    alunosMax: 20,
    descricao: "Treino focado em drible, passe e controle de bola.",
  }
  // outros...
];


const EditarTreinoPage = () => {       //Inicioda função
const { id } = useParams();

  // HOOKS NO TOPO — SEMPRE!
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditTreinoFormData>({
    resolver: zodResolver(editTreinoSchema),
  });

  const treino = treinosMock.find(t => t.id === id);

  // PREENCHE OS CAMPOS
useEffect(() => {
  if (treino) {
    reset({
      nome: treino.nome,
      categoria: treino.categoria,
      diaSemana: treino.diaSemana as "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo",
      hora: treino.hora,
      treinador: treino.treinador,
      alunosMax: treino.alunosMax,
      descricao: treino.descricao,
    });
  }
}, [treino, reset]);

  // SE NÃO ENCONTRAR → MOSTRA ERRO (DEPOIS DOS HOOKS!)
  if (!treino) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Treino não encontrado</h1>
        <Button asChild className="mt-4">
          <Link href="/treinos">Voltar</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: EditTreinoFormData) => {
    try {
      console.log("Treino atualizado:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Treino atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };
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
                        <SelectValue />
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
                {errors.categoria && <p className="text-sm text-red-600">Categoria obrigatória</p>}
              </div>

              <div className="space-y-2">
                <Label>Dia da Semana *</Label>
                <Controller
                  name="diaSemana"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Segunda">Segunda</SelectItem>
                        <SelectItem value="Terça">Terça</SelectItem>
                        <SelectItem value="Quarta">Quarta</SelectItem>
                        <SelectItem value="Quinta">Quinta</SelectItem>
                        <SelectItem value="Sexta">Sexta</SelectItem>
                        <SelectItem value="Sábado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.diaSemana && <p className="text-sm text-red-600">Dia obrigatório</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Horário *</Label>
                <Input type="time" {...register("hora")} />
                {errors.hora && <p className="text-sm text-red-600">Horário obrigatório</p>}
              </div>

              <div className="space-y-2">
                <Label>Treinador *</Label>
                <Controller
                  name="treinador"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
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
                {errors.treinador && <p className="text-sm text-red-600">Treinador obrigatório</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Máximo de Alunos *</Label>
              <Input type="number" min="1" max="30" {...register("alunosMax", { valueAsNumber: true })} />
              {errors.alunosMax && <p className="text-sm text-red-600">{errors.alunosMax.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Descrição do Treino (opcional)</Label>
              <Textarea
                className="resize-none"
                rows={5}
                {...register("descricao")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
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
}
 
export default EditarTreinoPage;