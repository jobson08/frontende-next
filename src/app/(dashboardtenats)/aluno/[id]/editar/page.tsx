// src/app/(dashboard)/alunos/[id]/editar/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { CalendarIcon, ChevronLeft, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label} from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Calendar } from "@/src/components/ui/calendar";

// Schema de validação
const editAlunoSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  birthDate: z.date(),
  phone: z.string().optional(),
  responsavelId: z.string().uuid().optional().or(z.literal("")),
  observations: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO", "TRANCADO"]),
});

type EditAlunoFormData = z.infer<typeof editAlunoSchema>;

// Mock de dados (depois substitua por fetch do backend)
const alunosMock = [
  {
    id: "1",
    name: "Enzo Gabriel Silva",
    birthDate: "2018-05-12",
    phone: "11988887777",
    responsavelId: "1",
    status: "ATIVO" as const,
    observations: "Alergia a amendoim. Usa óculos.",
  },
  {
    id: "2",
    name: "Maria Luiza Costa",
    birthDate: "2019-02-20",
    phone: "11977778888",
    responsavelId: "2",
    status: "ATIVO" as const,
    observations: "Adora natação!",
  },
  {
    id: "3",
    name: "Lucas Andrade",
    birthDate: "2005-11-30",
    phone: "11966667777",
    responsavelId: null,
    status: "ATIVO" as const,
    observations: "Maior de idade. Paga sozinho.",
  },
];
const responsaveisMock = [
  { id: "1", name: "Ana Clara Santos" },
  { id: "2", name: "Carlos Oliveira" },
  { id: "3", name: "Juliana Costa" },
];

const EditarAlunoPage = () => {     //inicio da função
const { id } = useParams();

  // HOOKS SEMPRE NO TOPO — NUNCA DEPOIS DE RETURN!
  const [date, setDate] = useState<Date | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditAlunoFormData>({
    resolver: zodResolver(editAlunoSchema),
    defaultValues: {
      name: "",
      phone: "",
      responsavelId: "",
      observations: "",
      status: "ATIVO",
      birthDate: new Date(),
    },
  });

  // BUSCA O ALUNO DEPOIS DOS HOOKS
  const aluno = alunosMock.find(a => a.id === id);

  // PREENCHE OS DADOS — DENTRO DO CORPO, MAS SÓ UMA VEZ (não causa loop porque é condicional)
  if (aluno && date === undefined) { // ← IMPORTANTE: evita loop!
    const birthDate = new Date(aluno.birthDate);
    setDate(birthDate);

    setValue("name", aluno.name);
    setValue("phone", aluno.phone);
    setValue("responsavelId", aluno.responsavelId || "");
    setValue("observations", aluno.observations);
    setValue("status", aluno.status);
    setValue("birthDate", birthDate);
  }

  // SE NÃO ENCONTRAR → MOSTRA ERRO (DEPOIS DOS HOOKS!)
  if (!aluno) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Aluno não encontrado</h1>
        <Button asChild>
          <Link href="/aluno">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: EditAlunoFormData) => {
    try {
      console.log("Aluno atualizado:", data);
      await new Promise(r => setTimeout(r, 1200));
      toast.success("Aluno atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };
    return ( 
       <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/aluno/${id}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Aluno</h1>
          <p className="text-gray-600">Atualize as informações de {aluno.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-6 w-6 text-blue-600" />
            Editar Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" {...register("name")} />
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate || undefined);
                      if (newDate) setValue("birthDate", newDate);
                    }}
                    disabled={(d) => d > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                defaultValue={aluno.responsavelId || ""}
                onValueChange={(value) => setValue("responsavelId", value || undefined)}
              >
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
              <Label>Status</Label>
              <Select
                defaultValue={aluno.status}
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
                className="resize-none"
                rows={4}
                {...register("observations")}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-4 pt-6">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/aluno/${id}`}>Cancelar</Link>
                      </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div> 
       
     );
}
 
export default EditarAlunoPage;