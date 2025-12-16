// src/app/(dashboard)/funcionarios/novo/page.tsx
"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Loader2, Save, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

const novoFuncionarioSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  role: z.enum(["PROFESSOR", "RECEPCAO", "ADMINISTRATIVO", "TREINADOR", "GERENTE"]),
  observations: z.string().optional(),
});

type NovoFuncionarioFormData = z.infer<typeof novoFuncionarioSchema>;

const NovoFuncionarioPage = () => {
   const {
  register,
  handleSubmit,
  control, // ← ADICIONE AQUI!
  setValue,
  formState: { errors, isSubmitting },
} = useForm<NovoFuncionarioFormData>({
  resolver: zodResolver(novoFuncionarioSchema),
  });

  const onSubmit = async (data: NovoFuncionarioFormData) => {
    try {
      console.log("Novo funcionário:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Funcionário cadastrado com sucesso!", {
        description: `${data.name} foi adicionado à equipe.`,
      });
    } catch {
      toast.error("Erro ao cadastrar funcionário");
    }
  };
    
    return ( 
     <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/funcionario">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Funcionário</h1>
          <p className="text-gray-600">Adicione um novo membro à equipe</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-orange-600" />
            Dados do Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" placeholder="Mariana Costa" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input id="phone" placeholder="(11) 99999-8888" {...register("phone")} />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="funcionario@academia.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>
                <Controller
                name="role"
                control={control}
                rules={{ required: "Cargo é obrigatório" }}
                render={({ field }) => (
                    <div className="space-y-2">
                    <Label>Cargo *</Label>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="PROFESSOR">Professor</SelectItem>
                        <SelectItem value="RECEPCAO">Recepção</SelectItem>
                        <SelectItem value="ADMINISTRATIVO">Administrativo</SelectItem>
                        <SelectItem value="TREINADOR">Treinador</SelectItem>
                        <SelectItem value="GERENTE">Gerente</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
                    </div>
                )}
                />
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Horário, especialidade, observações..."
                className="resize-none"
                rows={4}
                {...register("observations")}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Cadastrar Funcionário
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/funcionario">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>   
     );
}
 
export default NovoFuncionarioPage;