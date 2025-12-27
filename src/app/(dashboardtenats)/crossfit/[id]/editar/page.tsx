// src/app/(dashboard)/crossfit/[id]/editar/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, User, Mail, Phone, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

// Schema de validação (mesmo do novo)
const editarClienteSchema = z.object({
  nome: z.string().min(3, "Nome completo obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone obrigatório"),
  dataNascimento: z.string().min(1, "Data de nascimento obrigatória"),
  planoPagamento: z.enum(["Mensal", "Trimestral", "Semestral", "Anual"]),
  valorMensal: z.string().min(1, "Valor obrigatório"),
  observacoes: z.string().optional(),
});

type EditarClienteFormData = z.infer<typeof editarClienteSchema>;

// Mock de cliente (em produção vem do Supabase pelo id)
// Tipagem correta do mock
const clientesMock: Record<string, {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  planoPagamento: "Mensal" | "Trimestral" | "Semestral" | "Anual";
  valorMensal: string;
  observacoes: string;
}> = {
  "1": {
    nome: "Carlos Silva",
    email: "carlos.silva@email.com",
    telefone: "(11) 98765-4321",
    dataNascimento: "1985-03-15",
    planoPagamento: "Mensal",
    valorMensal: "149",
    observacoes: "Cliente experiente em CrossFit, prefere turmas avançadas.",
  },
  // outros...
};

const EditarClienteCrossFitPage = () => {
const { id } = useParams();
const clienteId = id as string;
const cliente = clientesMock[clienteId];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditarClienteFormData>({
    resolver: zodResolver(editarClienteSchema),
    defaultValues: cliente || {
      planoPagamento: "Mensal",
      valorMensal: "149",
    },
  });

// Verificação segura
if (!cliente) {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
      <Button asChild className="mt-4">
        <Link href="/crossfit">Voltar para lista</Link>
      </Button>
    </div>
  );
}

  const onSubmit = async (data: EditarClienteFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1500));
      console.log("Cliente CrossFit atualizado:", { id, ...data });
      toast.success("Cliente atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar alterações");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/crossfit">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Cliente CrossFit</h1>
          <p className="text-gray-600">Atualize as informações de {cliente.nome}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-red-600" />
            Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input id="nome" {...register("nome")} />
                {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  E-mail *
                </Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  Telefone *
                </Label>
                <Input id="telefone" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataNascimento" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Data de nascimento *
                </Label>
                <Input id="dataNascimento" type="date" {...register("dataNascimento")} />
                {errors.dataNascimento && <p className="text-sm text-red-600">{errors.dataNascimento.message}</p>}
              </div>
            </div>

            {/* Plano e Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
              <div className="space-y-2">
                <Label htmlFor="planoPagamento">Plano de pagamento</Label>
                <Select defaultValue={cliente.planoPagamento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Trimestral">Trimestral (-10%)</SelectItem>
                    <SelectItem value="Semestral">Semestral (-15%)</SelectItem>
                    <SelectItem value="Anual">Anual (-20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  Valor mensal (R$)
                </Label>
                <Input id="valorMensal" type="number" {...register("valorMensal")} />
                {errors.valorMensal && <p className="text-sm text-red-600">{errors.valorMensal.message}</p>}
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
              >
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
              <Button type="button" variant="outline" asChild>
                <Link href="/crossfit">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarClienteCrossFitPage;