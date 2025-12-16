// src/app/(dashboard)/funcionarios/[id]/editar/page.tsx
"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";

const editFuncionarioSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["PROFESSOR", "RECEPCAO", "ADMINISTRATIVO", "TREINADOR", "GERENTE"]),
  observations: z.string().optional(),
});

type EditFuncionarioFormData = z.infer<typeof editFuncionarioSchema>;

const funcionariosMock = [
  {
    id: "1",
    name: "Mariana Costa",
    phone: "11999998888",
    email: "mariana@academia.com",
    role: "PROFESSOR",
    observations: "Especialista em musculação.",
  },
  {
    id: "2",
    name: "Rafael Lima",
    phone: "11988887777",
    email: "rafael@academia.com",
    role: "TREINADOR",
    observacoes: "Treinador de crossfit. Campeão regional 2023.",
  },

];
const EditarFuncionarioPage = () => {
  const { id } = useParams();

const {
  register,
  handleSubmit,
  control,     // ← ESSENCIAL!
  reset,
  formState: { errors, isSubmitting },
} = useForm<EditFuncionarioFormData>({
  resolver: zodResolver(editFuncionarioSchema),
});

  const funcionario = funcionariosMock.find(f => f.id === id);

useEffect(() => {
  if (funcionario) {
    reset({
      name: funcionario.name,
      phone: funcionario.phone,
      email: funcionario.email,
      role: funcionario.role as "PROFESSOR" | "RECEPCAO" | "ADMINISTRATIVO" | "TREINADOR" | "GERENTE",
      observations: funcionario.observations,
    });
  }
}, [funcionario, reset]);

  if (!funcionario) {
    return <div>Funcionário não encontrado</div>;
  }

  const onSubmit = async (data: EditFuncionarioFormData) => {
    try {
      console.log("Atualizado:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Funcionário atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };  
    return ( 
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/funcionario/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Funcionário</h1>
          <p className="text-gray-600">Atualize as informações de {funcionario.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6 text-orange-600" />
            Editar Funcionário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input {...register("name")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" {...register("email")} />
              </div>
            </div>
           <Controller
                name="role"
                control={control}
                rules={{ required: "Cargo é obrigatório" }}
                render={({ field }) => (
                    <div className="space-y-2">
                    <Label>Cargo *</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
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
              <Label>Observações</Label>
              <Textarea {...register("observations")} rows={4} />
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/funcionario/${id}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
     );
}
 
export default EditarFuncionarioPage;