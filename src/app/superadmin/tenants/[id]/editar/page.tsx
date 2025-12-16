// src/app/superadmin/tenants/[id]/editar/page.tsx
"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";


// Schema de validação (mesmo do novo, mas com campos opcionais para edição)
const editTenantSchema = z.object({
  name: z.string().min(3, "Nome da escolinha deve ter pelo menos 3 caracteres"),
  cidade: z.string().min(2, "Cidade obrigatória"),
  estado: z.enum(["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"]),
  endereco: z.string().min(5, "Endereço completo obrigatório"),
  telefone: z.string().min(10, "Telefone inválido"),
  emailAdmin: z.string().email("E-mail do admin inválido"),
  nomeAdmin: z.string().min(3, "Nome do administrador obrigatório"),
  plano: z.enum(["Básico", "Pro", "Enterprise"]),
  observacoes: z.string().optional(),
});

type EditTenantFormData = z.infer<typeof editTenantSchema>;

// Mock
const tenantsMock = [
  {
id: "1",
    name: "Escolinha Gol de Placa",
    cidade: "São Paulo",
    estado: "SP" as const,
    endereco: "Rua das Flores, 123",
    telefone: "(11) 99999-8888",
    emailAdmin: "admin@goldeplaca.com",
    nomeAdmin: "João Silva",
    plano: "Pro" as const,
    observacoes: "Foco em sub-11 e sub-13.",
  },
  // outros...
];

const EditarTenantPage = () => {        //inicio da função

const { id } = useParams();

  // HOOKS NO TOPO — SEMPRE!
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditTenantFormData>({
    resolver: zodResolver(editTenantSchema),
  });

  const tenant = tenantsMock.find(t => t.id === id);

  // PREENCHE OS CAMPOS
  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        cidade: tenant.cidade,
        estado: tenant.estado,
        endereco: tenant.endereco,
        telefone: tenant.telefone,
        emailAdmin: tenant.emailAdmin,
        nomeAdmin: tenant.nomeAdmin,
        plano: tenant.plano,
        observacoes: tenant.observacoes,
      });
    }
  }, [tenant, reset]);

  // SE NÃO ENCONTRAR → MOSTRA ERRO (DEPOIS DOS HOOKS!)
  if (!tenant) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">Escolinha não encontrada</h1>
        <Button asChild className="mt-4">
          <Link href="/superadmin/tenants">Voltar</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: EditTenantFormData) => {
    try {
      console.log("Atualizado:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Escolinha atualizada com sucesso!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };
    return ( 
   <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/superadmin/tenants/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Escolinha</h1>
          <p className="text-gray-600">Atualize as informações de {tenant.name}</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6 text-green-600" />
            Editar Dados da Escolinha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome da Escolinha */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Escolinha *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Localização */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input {...register("cidade")} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Controller
                  name="estado"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        {/* Adicione mais */}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Endereço e Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo *</Label>
                <Input id="endereco" {...register("endereco")} />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input id="telefone" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>
            </div>

            {/* Administrador */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Administrador da Escolinha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeAdmin">Nome do administrador *</Label>
                  <Input id="nomeAdmin" {...register("nomeAdmin")} />
                  {errors.nomeAdmin && <p className="text-sm text-red-600">{errors.nomeAdmin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAdmin">E-mail do administrador *</Label>
                  <Input id="emailAdmin" type="email" {...register("emailAdmin")} />
                  {errors.emailAdmin && <p className="text-sm text-red-600">{errors.emailAdmin.message}</p>}
                </div>
              </div>
            </div>

            {/* Plano */}
         <div className="space-y-2">
              <Label>Plano</Label>
              <Controller
                name="plano"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Básico">Básico</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                className="resize-none"
                rows={4}
                {...register("observacoes")}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
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
                <Link href={`/superadmin/tenants/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    );
}
 
export default EditarTenantPage;