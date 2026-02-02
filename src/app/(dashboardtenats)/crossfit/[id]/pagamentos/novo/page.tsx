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

const schema = z.object({
  mesReferencia: z.string().min(1, "Mês de referência obrigatório"),
  dataVencimento: z.string().min(1, "Data de vencimento obrigatória"),
  valor: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido (ex: 149.90)")
    .min(1, "Valor obrigatório"),
});

type FormData = z.infer<typeof schema>;

export default function NovoPagamentoCrossfit() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      mesReferencia: format(new Date(), "yyyy-MM"),
      dataVencimento: format(new Date(new Date().setDate(10)), "yyyy-MM-dd"),
      valor: "149.00",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        mesReferencia: `${data.mesReferencia}-01`,
        dataVencimento: data.dataVencimento,
        valor: parseFloat(data.valor),
      };

      return api.post(`/tenant/alunos-crossfit/${id}/mensalidades/manual`, payload);
    },
    onSuccess: () => {
      toast.success("Mensalidade manual criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["aluno-crossfit-pagamentos", id] });
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
          <Link href={`/crossfit/${id}/pagamentos`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Mensalidade Manual</h1>
          <p className="text-gray-600">Crie uma mensalidade avulsa ou ajuste para este aluno</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="mesReferencia">Mês de referência</Label>
                <Input
                  id="mesReferencia"
                  type="month"
                  {...register("mesReferencia")}
                />
                {errors.mesReferencia && <p className="text-sm text-red-600">{errors.mesReferencia.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  {...register("dataVencimento")}
                />
                {errors.dataVencimento && <p className="text-sm text-red-600">{errors.dataVencimento.message}</p>}
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