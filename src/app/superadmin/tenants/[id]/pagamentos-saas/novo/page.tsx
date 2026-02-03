/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/(escolinhas)/escolinhas/[id]/pagamentos-saas/novo/page.tsx
"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, addBusinessDays } from "date-fns";
import { ChevronLeft, Loader2, DollarSign, Calendar, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import api from "@/src/lib/api";

// Schema de validação
const formSchema = z.object({
  valor: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido (ex: 149.90)")
    .min(1, "Valor obrigatório"),
  dataVencimento: z.string().min(1, "Data de vencimento obrigatória"),
  observacao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NovoPagamentoSaaSPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Busca dados da escolinha (para pré-preencher valor e nome)
  const { data: escolinha, isLoading: loadingEscolinha, error: escolinhaError } = useQuery({
    queryKey: ["escolinha", id],
    queryFn: async () => {
      const res = await api.get(`/superadmin/escolinhas/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valor: "",
      dataVencimento: format(addBusinessDays(new Date(), 5), "yyyy-MM-dd"),
      observacao: "Cobrança manual SaaS gerada por superAdmin",
    },
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = form;

  // Pré-preenche valor do plano quando a escolinha carrega
  useEffect(() => {
    if (escolinha?.valorPlanoMensal) {
      setValue("valor", escolinha.valorPlanoMensal.toFixed(2));
    }
  }, [escolinha, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        valor: parseFloat(data.valor),
        dataVencimento: data.dataVencimento,
        observacao: data.observacao?.trim(),
      };

      return api.post(`/superadmin/escolinhas/${id}/pagamentos-saas/manual`, payload);
    },

    onSuccess: () => {
      toast.success("Cobrança SaaS criada com sucesso!", {
        description: "O pagamento foi gerado e adicionado ao histórico da escolinha.",
        duration: 5000,
      });

      // Atualiza cache e volta para lista de pagamentos
      setTimeout(() => {
        router.push(`/superadmin/tenants/${id}`);
      }, 1500);
    },

    onError: (err: any) => {
      console.error("[CRIA PAGAMENTO SAAS]", err);
      toast.error("Erro ao criar cobrança SaaS", {
        description: err.response?.data?.error || err.message || "Verifique os dados e tente novamente",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  // Loading
  if (loadingEscolinha) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando dados da escolinha...</span>
      </div>
    );
  }

  // Erro ou não encontrado
  if (escolinhaError || !escolinha) {
    return (
      <div className="p-8 text-center text-red-600">
        <AlertCircle className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Escolinha não encontrada</h1>
        <p className="mt-2">Verifique o ID ou suas permissões de superAdmin.</p>
        <Button asChild className="mt-6">
          <Link href="/escolinhas">Voltar para lista de escolinhas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/escolinhas/${id}/pagamentos`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Cobrança SaaS</h1>
          <p className="text-gray-600">
            Gerar pagamento manual para a escolinha <strong>{escolinha.nome}</strong>
          </p>
        </div>
      </div>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-3 text-green-800">
            <DollarSign className="h-6 w-6" />
            Dados da Cobrança SaaS
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {mutation.isPending && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center mb-6">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-blue-800">Criando cobrança SaaS... Aguarde</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor do Plano (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="149.90"
                {...register("valor")}
              />
              {errors.valor && <p className="text-sm text-red-600">{errors.valor.message}</p>}
              <p className="text-xs text-gray-500">
                Valor atual do plano: R$ {escolinha.valorPlanoMensal?.toFixed(2) || "0.00"}
              </p>
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento</Label>
              <Input
                id="dataVencimento"
                type="date"
                {...register("dataVencimento")}
              />
              {errors.dataVencimento && <p className="text-sm text-red-600">{errors.dataVencimento.message}</p>}
              <p className="text-xs text-gray-500">
                Sugestão: {format(addBusinessDays(new Date(), 5), "dd/MM/yyyy")} (5 dias úteis)
              </p>
            </div>

            {/* Observação */}
            <div className="space-y-2">
              <Label htmlFor="observacao">Observação / Motivo (opcional)</Label>
              <Textarea
                id="observacao"
                placeholder="Ex: Primeiro pagamento após ativação do plano Pro / Ajuste de atraso"
                rows={4}
                {...register("observacao")}
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Cobrança...
                  </>
                ) : (
                  "Gerar Cobrança SaaS"
                )}
              </Button>

              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href={`/superadmin/tenants/${escolinha.id}`}>
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}