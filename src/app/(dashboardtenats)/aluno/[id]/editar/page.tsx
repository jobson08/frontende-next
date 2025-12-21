// src/app/(dashboard)/alunos/[id]/editar/page.tsx
"use client";
import {  useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { CalendarIcon, Camera, ChevronLeft, Loader2, Save, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Label} from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Calendar } from "@/src/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

// Schema de validação
const editAlunoSchema = z.object({
  name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  birthDate: z.date({ message: "Data de nascimento é obrigatória e deve ser válida" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(), // ← ADICIONADO
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }), // ← ADICIONADO
  responsavelId: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO", "TRANCADO"]),
  observations: z.string().optional(),
});

type EditAlunoFormData = z.infer<typeof editAlunoSchema>;

// Mock de dados (depois substitua por fetch do backend)
const alunosMock = [
  {
   id: "1",
    name: "Enzo Gabriel Silva",
    birthDate: "2014-05-15",
    phone: "(11) 98888-7777",
    cpf: "123.456.789-00",
    categoria: "Sub-11",
    responsavelId: "1",
    status: "ATIVO",
    observations: "Alergia a amendoim. Usa óculos.",
    photo: null,
  },
  {
    id: "2",
    name: "Maria Luiza Costa",
    birthDate: "2019-02-20",
    phone: "11977778888",
    cpf: "123.456.789-00",
    categoria: "Sub-9",
    responsavelId: "2",
    status: "ATIVO" as const,
    observations: "Adora natação!",
    photo: null,
  },
  {
    id: "3",
    name: "Lucas Andrade",
    birthDate: "2005-11-30",
    phone: "11966667777",
    cpf: "123.456.789-00",
    categoria: "Sub-17",
    responsavelId: null,
    status: "ATIVO" as const,
    observations: "Maior de idade. Paga sozinho.",
    photo: null,
  },
];
const responsaveisMock = [
  { id: "1", name: "Ana Clara Santos" },
  { id: "2", name: "Carlos Oliveira" },
  { id: "3", name: "Juliana Costa" },
];

const EditarAlunoPage = () => {     //inicio da função
  
const { id } = useParams();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditAlunoFormData>({
    resolver: zodResolver(editAlunoSchema),
  });

  const watchedName = watch("name");

  // BUSCA O ALUNO
  const aluno = alunosMock.find(a => a.id === id);

  // PREENCHE OS DADOS (só uma vez)
  useEffect(() => {
    if (aluno) {
      const birthDate = new Date(aluno.birthDate);
      setDate(birthDate);
      setPhotoPreview(aluno.photo);

    setValue("name", aluno.name);
    setValue("birthDate", birthDate);
    setValue("phone", aluno.phone);
    setValue("cpf", aluno.cpf || ""); // ← AGORA ACEITA
    setValue("categoria", aluno.categoria); // ← AGORA ACEITA
    setValue("responsavelId", aluno.responsavelId || "");
    setValue("status", aluno.status as "ATIVO" | "INATIVO" | "TRANCADO");
    setValue("observations", aluno.observations);
    }
  }, [aluno, setValue]);

  // SE NÃO ENCONTRAR
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: EditAlunoFormData) => {
    try {
      console.log("Aluno atualizado:", data, "Foto:", photoPreview);
      await new Promise(r => setTimeout(r, 1200));
      alert("Aluno atualizado com sucesso!");
    } catch {
      alert("Erro ao salvar");
    }
  };
    return ( 
      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aluno">
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
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Save className="h-7 w-7 text-blue-600" />
            Editar Dados do Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto do Aluno */}
            <div className="flex flex-col items-center gap-4 py-6 border-b">
              <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                <AvatarImage src={photoPreview || undefined} />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                  {watchedName ? watchedName.split(" ").map(n => n[0]).join("").toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="mr-2 h-4 w-4" />
                  Alterar foto
                </Button>
                {photoPreview && (
                  <Button type="button" variant="destructive" size="sm" onClick={removePhoto}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remover
                  </Button>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Informações Pessoais */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome Completo */}
                <div className="md:col-span-2 space-y-2">
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
                        onSelect={(newDate) => {
                          setDate(newDate || undefined);
                          if (newDate) setValue("birthDate", newDate);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.birthDate && <p className="text-sm text-red-600">Data de nascimento é obrigatória</p>}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input id="phone" placeholder="(11) 98888-7777" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" placeholder="123.456.789-00" {...register("cpf")} />
                </div>

                {/* Categoria */}
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select onValueChange={(value) => setValue("categoria", value)} defaultValue={aluno.categoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sub-9">Sub-9</SelectItem>
                      <SelectItem value="Sub-11">Sub-11</SelectItem>
                      <SelectItem value="Sub-13">Sub-13</SelectItem>
                      <SelectItem value="Sub-15">Sub-15</SelectItem>
                      <SelectItem value="Sub-17">Sub-17</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.categoria && <p className="text-sm text-red-600">{errors.categoria.message}</p>}
                </div>
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Responsável</h3>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select onValueChange={(value) => setValue("responsavelId", value || undefined)} defaultValue={aluno.responsavelId || ""}>
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
            </div>

            {/* Status e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={aluno.status} onValueChange={(value) => setValue("status", value as "ATIVO" | "INATIVO" | "TRANCADO")}>
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
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Alergias, restrições médicas, informações importantes..."
                  className="resize-none min-h-32"
                  rows={5}
                  {...register("observations")}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/aluno">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
       
     );
}
 
export default EditarAlunoPage;