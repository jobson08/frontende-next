// src/app/superadmin/tenants/novo/page.tsx
"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Save, Loader2, Building2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";


// Schema de validação
const novoTenantSchema = z.object({
  name: z.string().min(3),
  cidade: z.string().min(2),
  estado: z.enum(["AC", "AL", /* ... */ "TO"]),
  endereco: z.string().min(5),
  telefone: z.string().min(10),
  emailAdmin: z.string().email(),
  nomeAdmin: z.string().min(3),
  plano: z.enum(["Básico", "Pro", "Enterprise"]),
  observacoes: z.string().optional(), // ← COM "Ç"
});

type NovoTenantFormData = z.infer<typeof novoTenantSchema>;

const NovoTenantPage = () => {      //Inicio da função
    const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NovoTenantFormData>({
    resolver: zodResolver(novoTenantSchema),
  });

  const onSubmit = async (data: NovoTenantFormData) => {
    try {
      console.log("Nova escolinha criada:", data);
      await new Promise(r => setTimeout(r, 1500));

      toast.success("Escolinha criada com sucesso!", {
        description: `${data.name} foi adicionada à plataforma FutElite. Acesso enviado para ${data.emailAdmin}.`,
      });
    } catch {
      toast.error("Erro ao criar escolinha");
    }
  };
    return ( 
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/superadmin/tenants">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Escolinha de Futebol</h1>
          <p className="text-gray-600">Adicione uma nova unidade à plataforma FutElite</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-green-600" />
            Dados da Escolinha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome da Escolinha */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Escolinha *</Label>
              <Input id="name" placeholder="Ex: Gol de Placa Academy" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Localização */}
                    <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Controller
                        name="estado"
                        control={control}
                        rules={{ required: "Estado obrigatório" }}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            {/* Adicione mais estados */}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
                    </div>

            {/* Endereço e Telefone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo *</Label>
                <Input id="endereco" placeholder="Rua das Flores, 123 - Centro" {...register("endereco")} />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone da escolinha *</Label>
                <Input id="telefone" placeholder="(11) 99999-8888" {...register("telefone")} />
                {errors.telefone && <p className="text-sm text-red-600">{errors.telefone.message}</p>}
              </div>
            </div>

            {/* Administrador da Escolinha */}
            <div className="space-y-4 pt-6 border-t">
              <h3 className="text-lg font-semibold">Administrador da Escolinha</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeAdmin">Nome do administrador *</Label>
                  <Input id="nomeAdmin" placeholder="João Silva" {...register("nomeAdmin")} />
                  {errors.nomeAdmin && <p className="text-sm text-red-600">{errors.nomeAdmin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAdmin">E-mail do administrador *</Label>
                  <Input id="emailAdmin" type="email" placeholder="admin@escolinha.com" {...register("emailAdmin")} />
                  {errors.emailAdmin && <p className="text-sm text-red-600">{errors.emailAdmin.message}</p>}
                </div>
              </div>
            </div>

            {/* Plano */}
           <div className="space-y-2">
                <Label>Plano da Escolinha *</Label>
                <Controller
                    name="plano"
                    control={control}
                    rules={{ required: "Plano obrigatório" }}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Básico">Básico - R$ 299/mês</SelectItem>
                        <SelectItem value="Pro">Pro - R$ 599/mês</SelectItem>
                        <SelectItem value="Enterprise">Enterprise - R$ 999/mês</SelectItem>
                        </SelectContent>
                    </Select>
                    )}
                />
                {errors.plano && <p className="text-sm text-red-600">{errors.plano.message}</p>}
                </div>

            {/* Observações */}
                <Textarea
                id="observacoes"
                placeholder="Ex: Escolinha focada em categorias sub-11..."
                className="resize-none"
                rows={4}
                {...register("observacoes")} // ← COM "Ç"
                />

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando escolinha...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Escolinha
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/superadmin/tenants">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
    );
}
 
export default NovoTenantPage;