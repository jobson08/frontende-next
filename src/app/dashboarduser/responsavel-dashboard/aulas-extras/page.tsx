// src/app/dashboarduser/responsavel-dashboard/aulas-extras/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { Trophy, Calendar, Clock, User, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

// Tipos de aula extra (em produção vem das configurações da escolinha)
const tiposAulaExtra = [
  { id: "1", nome: "Condicionamento Físico", valor: 80, duracao: "45 min" },
  { id: "2", nome: "Finalização", valor: 80, duracao: "45 min" },
  { id: "3", nome: "Drible e Controle de Bola", valor: 80, duracao: "45 min" },
  { id: "4", nome: "Cabeceio", valor: 70, duracao: "30 min" },
  { id: "5", nome: "Treino de Goleiro", valor: 90, duracao: "60 min" },
];

// Alunos do responsável (mock)
const alunosDoResponsavel = [
  { id: "1", nome: "Pedro Silva" },
  { id: "2", nome: "Lucas Silva" },
];

// Schema de validação
const solicitacaoSchema = z.object({
  alunoId: z.string().min(1, "Selecione o aluno"),
  tipoAulaId: z.string().min(1, "Selecione o tipo de aula"),
  dataPreferida: z.string().min(1, "Selecione a data"),
  horarioPreferido: z.string().min(1, "Informe o horário preferido"),
  observacoes: z.string().optional(),
});

type SolicitacaoFormData = z.infer<typeof solicitacaoSchema>;

const SolicitacaoAulaExtraPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SolicitacaoFormData>({
    resolver: zodResolver(solicitacaoSchema),
  });

  const tipoAulaSelecionada = watch("tipoAulaId");
  const aulaSelecionada = tiposAulaExtra.find(a => a.id === tipoAulaSelecionada);

  const onSubmit = async (data: SolicitacaoFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1500));
      console.log("Solicitação de aula extra enviada:", data);
      toast.success("Solicitação enviada com sucesso!", {
        description: `Aula de ${aulaSelecionada?.nome} para ${alunosDoResponsavel.find(a => a.id === data.alunoId)?.nome} foi solicitada.`,
      });
    } catch {
      toast.error("Erro ao enviar solicitação");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-600" />
          Solicitar Aula Extra
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Peça uma aula individual personalizada para seu filho com um dos nossos treinadores
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-yellow-600" />
            Preencha os dados da solicitação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Aluno */}
            <div className="space-y-2">
              <Label htmlFor="alunoId">Para qual filho? *</Label>
              <Select {...register("alunoId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunosDoResponsavel.map(aluno => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.alunoId && <p className="text-sm text-red-600">{errors.alunoId.message}</p>}
            </div>

            {/* Tipo de Aula */}
            <div className="space-y-2">
              <Label htmlFor="tipoAulaId">Tipo de aula extra *</Label>
              <Select {...register("tipoAulaId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o tipo de aula" />
                </SelectTrigger>
                <SelectContent>
                  {tiposAulaExtra.map(aula => (
                    <SelectItem key={aula.id} value={aula.id}>
                      <div className="flex justify-between w-full">
                        <span>{aula.nome}</span>
                        <span className="text-sm text-gray-500">
                          R$ {aula.valor} • {aula.duracao}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoAulaId && <p className="text-sm text-red-600">{errors.tipoAulaId.message}</p>}

              {aulaSelecionada && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium">Aula selecionada:</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {aulaSelecionada.nome}
                  </p>
                  <p className="text-sm text-gray-700">
                    Valor: R$ {aulaSelecionada.valor} • Duração: {aulaSelecionada.duracao}
                  </p>
                </div>
              )}
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dataPreferida" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Data preferida *
                </Label>
                <Input id="dataPreferida" type="date" {...register("dataPreferida")} />
                {errors.dataPreferida && <p className="text-sm text-red-600">{errors.dataPreferida.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horarioPreferido" className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Horário preferido *
                </Label>
                <Input 
                  id="horarioPreferido" 
                  placeholder="ex: 18:00 às 19:00" 
                  {...register("horarioPreferido")} 
                />
                {errors.horarioPreferido && <p className="text-sm text-red-600">{errors.horarioPreferido.message}</p>}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="ex: Meu filho quer focar em finalização com a perna esquerda"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botão Enviar */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando solicitação...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitacaoAulaExtraPage;