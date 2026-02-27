/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit/[id]/pagamentos/novo/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChevronLeft, Loader2, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { ptBR } from "date-fns/locale";

const schema = z.object({
  dataVencimento: z.string().min(1, "Data de vencimento obrigatória"),
  valor: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido (ex: 149.90)")
    .min(1, "Valor obrigatório"),
  // Removido mesReferencia do schema (calculado automaticamente)
});

type FormData = z.infer<typeof schema>;

export default function NovoPagamentoAlunoFutebol() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      dataVencimento: format(new Date(new Date().setDate(10)), "yyyy-MM-dd"),
      valor: "90.00",
    },
  });

  const dataVencimento = watch("dataVencimento");

  // Calcula mês de referência automaticamente
  const mesReferenciaCalculado = dataVencimento
    ? format(new Date(dataVencimento), "yyyy-MM") + "-01"
    : format(new Date(), "yyyy-MM") + "-01";

  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const payload = {
        mesReferencia: mesReferenciaCalculado,  // ← calculado automaticamente
        dataVencimento: formData.dataVencimento,
        valor: parseFloat(formData.valor),
      };

      console.log("Payload enviado (mês calculado automaticamente):", payload);

      return api.post(`/tenant/alunos/${id}/pagamentos`, payload);
    },
    onSuccess: () => {
      toast.success("Mensalidade manual criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["pagamentos-aluno", id] });
      setTimeout(() => router.back(), 1500);
    },
    onError: (err: any) => {
      toast.error("Erro ao criar mensalidade", {
        description: err.response?.data?.error || "Verifique os dados",
      });
    },
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);
  return (
<div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/aluno/${id}/pagamentos`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Mensalidade Manual</h1>
          <p className="text-gray-600">Crie uma mensalidade avulsa para este aluno</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Dados da Mensalidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  {...register("dataVencimento")}
                />
                {errors.dataVencimento && <p className="text-sm text-red-600">{errors.dataVencimento.message}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  O mês de referência será calculado automaticamente com base nesta data
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  {...register("valor")}
                />
                {errors.valor && <p className="text-sm text-red-600">{errors.valor.message}</p>}
              </div>
            </div>

            {/* Mostra o mês calculado para o usuário confirmar */}
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm font-medium">
                Mês de referência calculado automaticamente: <br/>
                <span className="text-lg font-bold">
                  {format(new Date(mesReferenciaCalculado), "MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Gerar Mensalidade Manual"
                )}
              </Button>

              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/crossfit/${id}/pagamentos`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}