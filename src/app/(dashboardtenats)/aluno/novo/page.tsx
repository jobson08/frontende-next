"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { UserPlus, ChevronLeft, Loader2, Trash2, Camera, CalendarIcon } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Calendar } from "@/src/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

// Mock de responsáveis (em produção vem do banco)
const responsaveisMock = [
  { id: "1", name: "Maria Oliveira Santos" },
  { id: "2", name: "João Pedro Costa" },
  { id: "3", name: "Ana Clara Lima" },
];

// Schema Zod v3 compatível
const formSchema = z.object({
  name: z.string().min(3, { message: "Nome completo é obrigatório" }),
  birthDate: z.date({ message: "Data de nascimento é obrigatória e deve ser válida" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  cpf: z.string().optional(),
  categoria: z.string().min(1, { message: "Categoria é obrigatória" }),
  responsavelId: z.string().optional(), // ID do responsável selecionado
  status: z.enum(["ATIVO", "INATIVO", "TRANCADO"]),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const NovoAlunoPage = () => {   //Inicio da função

 const [date, setDate] = useState<Date | undefined>(undefined);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const watchedName = watch("name");

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

  const onSubmit = async (data: FormData) => {
    console.log("Dados do aluno:", data, "Foto:", photoPreview);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Aluno cadastrado com sucesso!");
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
          <h1 className="text-3xl font-bold">Novo Aluno</h1>
          <p className="text-gray-600">Preencha os dados do novo aluno</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <UserPlus className="h-7 w-7 text-blue-600" />
            Dados do Aluno
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
                  Escolher foto
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
              <p className="text-xs text-gray-500 text-center">Foto opcional (JPG, PNG até 5MB)</p>
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

                {/* Data de Nascimento — SEU CÓDIGO ORIGINAL QUE FUNCIONAVA PERFEITO */}
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
                  <Select onValueChange={(value) => setValue("categoria", value)}>
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

            {/* Responsável — SEU CÓDIGO ORIGINAL QUE FUNCIONAVA PERFEITO */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Responsável</h3>
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
            </div>

            {/* Status e Observações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status inicial</Label>
                <Select defaultValue="ATIVO" onValueChange={(value) => setValue("status", value as "ATIVO" | "INATIVO" | "TRANCADO")}>
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
                  placeholder="Alergias, restrições médicas, informações importantes sobre o aluno..."
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
                    Criando aluno...
                  </>
                ) : (
                  "Criar Aluno"
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
 
export default NovoAlunoPage;