"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, UserPlus, ChevronLeft } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
//import { useToast } from "@/src/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// Schema de validação
const createAlunoSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birthDate: z.date(),
  phone: z.string().optional(),
  responsavelId: z.string().uuid().optional(),
  observations: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO", "TRANCADO"]), // ← OBRIGATÓRIO AQUI
});

type CreateAlunoFormData = z.infer<typeof createAlunoSchema>;

const responsaveisMock = [
  { id: "1", name: "Ana Clara Santos" },
  { id: "2", name: "Carlos Oliveira" },
  { id: "3", name: "Juliana Costa" },
];

const NovoAlunoPage = () => {
const [date, setDate] = useState<Date>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<CreateAlunoFormData>({
    resolver: zodResolver(createAlunoSchema),
    defaultValues: {
      status: "ATIVO", // ← DEFAULT AQUI, NÃO NO SCHEMA
    },
  });

  const onSubmit = async (data: CreateAlunoFormData) => {
    try {
      console.log("Dados do aluno:", {
        ...data,
        birthDate: data.birthDate.toISOString().split("T")[0],
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Aluno criado com sucesso!", {
        description: `${data.name} foi adicionado à sua academia.`,
      });
    } catch (error) {
      toast.error("Erro ao criar aluno", {
        description: "Tente novamente mais tarde.",
      });
    }
  };
    return ( 
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aluno">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Aluno</h1>
          <p className="text-gray-600">Preencha os dados do novo aluno</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" placeholder="Enzo Gabriel Silva" {...register("name")} />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label>Data de nascimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date || undefined);
                      if (date) setValue("birthDate", date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.birthDate && <p className="text-sm text-red-600">Data de nascimento é obrigatória</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 98888-7777" {...register("phone")} />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Select onValueChange={(value) => setValue("responsavelId", value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveisMock.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status inicial</Label>
              <Select
                defaultValue="ATIVO"
                onValueChange={(value) => setValue("status", value as "ATIVO" | "INATIVO" | "TRANCADO")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">Ativo</SelectItem>
                  <SelectItem value="INATIVO">Inativo</SelectItem>
                  <SelectItem value="TRANCADO">Trancado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Alergias, restrições, informações importantes..."
                className="resize-none"
                rows={4}
                {...register("observations")}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Criando aluno..." : "Criar Aluno"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/aluno">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    );
}
 
export default NovoAlunoPage;