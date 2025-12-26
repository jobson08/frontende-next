// src/app/superadmin/configuracoes/page.tsx
"use client";

import { useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { Loader2, Camera, Trash2, Palette, Building2, DollarSign, Percent, CalendarDays, Send, Mail, Bell, AlertTriangle, Users, Shield, UserX, Activity, UserPlus, Clock, Download, Database } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";


// Schema para Perfil do Superadmin ABA 1
const perfilSchema = z.object({
  nome: z.string().min(3, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
});

// Schema para Identidade Visual    ABA 2
const identidadeSchema = z.object({
  nomePlataforma: z.string().min(3, "Nome da plataforma obrigatório"),
});

// Schema para Planos e Preços ABA 3
const planosSchema = z.object({
  basicoAtivo: z.boolean(),
  basicoPreco: z.string().min(1, "Preço obrigatório"),
  basicoAlunos: z.string().min(1, "Limite obrigatório"),
  basicoTesteDias: z.string().optional(),

  proAtivo: z.boolean(),
  proPreco: z.string().min(1, "Preço obrigatório"),
  proAlunos: z.string().min(1, "Limite obrigatório"),
  proTesteDias: z.string().optional(),

  enterpriseAtivo: z.boolean(),
  enterprisePreco: z.string().min(1, "Preço obrigatório"),
  enterpriseAlunos: z.string().min(1, "Limite obrigatório"),
  enterpriseTesteDias: z.string().optional(),
});

// Schema para Pagamentos e Financeiro ABA 4
const financeiroSchema = z.object({
  chavePix: z.string().min(1, "Chave PIX obrigatória"),
  taxaAdministrativa: z.string().min(1, "Taxa obrigatória"),
  diasTolerancia: z.string().min(1, "Dias de tolerância obrigatórios"),
});

// Schema para Notificações e Templates ABA 5
const notificacoesSchema = z.object({
  emailSuporte: z.string().email("E-mail de suporte inválido"),
  ativarNotificacoesAutomaticas: z.boolean(),
  templateBemVindo: z.string().optional(),
  templatePagamentoAtrasado: z.string().optional(),
  templateNovoAluno: z.string().optional(),
});

// Schema para Regras da Plataforma ABA 6
const regrasSchema = z.object({
  idadeMinima: z.string().min(1, "Idade mínima obrigatória"),
  idadeMaxima: z.string().min(1, "Idade máxima obrigatória"),
  categoriasPadrao: z.string().optional(),
  diasAtrasoSuspensao: z.string().min(1, "Dias para suspensão obrigatórios"),
  ativarSuspensaoAutomatica: z.boolean(),
});

// Schema para Segurança ABA 7
const segurancaSchema = z.object({
  ativar2FAObrigatorio: z.boolean(),
  novoSuperAdminEmail: z.string().email().optional(),
});

// Schema para Backup e Exportação ABA 8
const backupSchema = z.object({
  frequenciaBackup: z.enum(["diario", "semanal", "mensal"]),
  ativarBackupAutomatico: z.boolean(),
});

type PerfilFormData = z.infer<typeof perfilSchema>; //ABA1
type IdentidadeFormData = z.infer<typeof identidadeSchema>; //ABA 2
type PlanosFormData = z.infer<typeof planosSchema>; //ABA 3
type FinanceiroFormData = z.infer<typeof financeiroSchema>; //ABA 4
type NotificacoesFormData = z.infer<typeof notificacoesSchema>;//ABA 5
type RegrasFormData = z.infer<typeof regrasSchema>; //ABA 6
type SegurancaFormData = z.infer<typeof segurancaSchema>; //ABA 7
type BackupFormData = z.infer<typeof backupSchema>; //ABA 8

const ConfiguracoesPage = () => {       //Inicio da função
    //(Etapa 1)
  // Perfil do Superadmin 
  const [fotoPreview, setFotoPreview] = useState<string | null>("https://example.com/superadmin-foto.jpg");
  const fotoInputRef = useRef<HTMLInputElement>(null);

  

// Form Perfil (1)
  const {
    register: registerPerfil,
    handleSubmit: handleSubmitPerfil,
    formState: { isSubmitting: isSubmittingPerfil },
  } = useForm({
    defaultValues: {
      nome: "Super Admin",
      email: "superadmin@futelite.com",
      telefone: "(11) 99999-8888",
    },
  });
    // Handlers Perfil
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

// Form Identidade (2)
  const {
    register: registerIdentidade,
    handleSubmit: handleSubmitIdentidade,
    formState: { isSubmitting: isSubmittingIdentidade },
  } = useForm({
    defaultValues: {
      nomePlataforma: "FutElite",
    },
  });
  // Identidade Visual
  const [logoPreview, setLogoPreview] = useState<string | null>("https://example.com/futelite-logo.png");
  const logoInputRef = useRef<HTMLInputElement>(null);
 
  const removeFoto = () => {
    setFotoPreview(null);
    if (fotoInputRef.current) fotoInputRef.current.value = "";
  };

  const onSubmitPerfil = async (data: PerfilFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Perfil atualizado:", data);
      toast.success("Perfil atualizado com sucesso!");
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  };

  // Handlers Identidade
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

   const onSubmitIdentidade = async (data: IdentidadeFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Identidade atualizada:", data);
      toast.success("Identidade visual atualizada com sucesso!");
    } catch {
      toast.error("Erro ao salvar identidade");
    }
  };

    // Form Planos (3)
  const {
    register: registerPlanos,
    handleSubmit: handleSubmitPlanos,
    formState: { isSubmitting: isSubmittingPlanos },
  } = useForm<PlanosFormData>({
    resolver: zodResolver(planosSchema),
    defaultValues: {
      basicoAtivo: true,
      basicoPreco: "299",
      basicoAlunos: "100",
      basicoTesteDias: "14",

      proAtivo: true,
      proPreco: "599",
      proAlunos: "500",
      proTesteDias: "30",

      enterpriseAtivo: true,
      enterprisePreco: "999",
      enterpriseAlunos: "Ilimitado",
      enterpriseTesteDias: "30",
    },
  });

  // Handler Planos
  const onSubmitPlanos = async (data: PlanosFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Planos atualizados:", data);
      toast.success("Planos e preços atualizados com sucesso!");
    } catch {
      toast.error("Erro ao salvar planos");
    }
  };

// Form Financeiro (4)
  const {
    register: registerFinanceiro,
    handleSubmit: handleSubmitFinanceiro,
    formState: { isSubmitting: isSubmittingFinanceiro },
  } = useForm<FinanceiroFormData>({
    resolver: zodResolver(financeiroSchema),
    defaultValues: {
      chavePix: "superadmin@futelite.com",
      taxaAdministrativa: "10",
      diasTolerancia: "15",
    },
  });

  // Handler Financeiro
  const onSubmitFinanceiro = async (data: FinanceiroFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Configurações financeiras atualizadas:", data);
      toast.success("Configurações financeiras atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações financeiras");
    }
  };

 // Form Notificações (5)
  const {
    register: registerNotificacoes,
    handleSubmit: handleSubmitNotificacoes,
    formState: { isSubmitting: isSubmittingNotificacoes },
  } = useForm<NotificacoesFormData>({
    resolver: zodResolver(notificacoesSchema),
    defaultValues: {
      emailSuporte: "suporte@futelite.com",
      ativarNotificacoesAutomaticas: true,
      templateBemVindo: "Bem-vindo à {nome_escolinha}! Sua conta foi criada com sucesso. Acesse em {link_login}.",
      templatePagamentoAtrasado: "Pagamento atrasado na {nome_escolinha}. Regularize até {data_vencimento} para evitar suspensão.",
      templateNovoAluno: "Novo aluno cadastrado: {nome_aluno} na {nome_escolinha}.",
    },
  });

  const onSubmitNotificacoes = async (data: NotificacoesFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Notificações e templates atualizados:", data);
      toast.success("Notificações e templates atualizados com sucesso!");
    } catch {
      toast.error("Erro ao salvar notificações");
    }
  };

    // Form Regras (6)
  const {
    register: registerRegras,
    handleSubmit: handleSubmitRegras,
    formState: { isSubmitting: isSubmittingRegras },
  } = useForm<RegrasFormData>({
    resolver: zodResolver(regrasSchema),
    defaultValues: {
      idadeMinima: "5",
      idadeMaxima: "17",
      categoriasPadrao: "Sub-7, Sub-9, Sub-11, Sub-13, Sub-15, Sub-17",
      diasAtrasoSuspensao: "30",
      ativarSuspensaoAutomatica: true,
    },
  });

   // Form Regras 
  const onSubmitRegras = async (data: RegrasFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Regras da plataforma atualizadas:", data);
      toast.success("Regras da plataforma atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao salvar regras");
    }
  };


  // Form Segurança (7)
  const {
    register: registerSeguranca,
    handleSubmit: handleSubmitSeguranca,
    reset: resetNovoAdmin,
    formState: { isSubmitting: isSubmittingSeguranca },
  } = useForm<SegurancaFormData>({
    resolver: zodResolver(segurancaSchema),
    defaultValues: {
      ativar2FAObrigatorio: true,
    },
  });

  //segurança e log 
// Mock de outros superadmins
  const outrosSuperAdmins = [
    { id: "1", nome: "João Silva", email: "joao@futelite.com", ultimoAcesso: "2025-12-25 14:30" },
    { id: "2", nome: "Maria Oliveira", email: "maria@futelite.com", ultimoAcesso: "2025-12-24 09:15" },
  ];

  // Mock de log de atividades
  const logAtividades = [
    { data: "2025-12-25 18:45", usuario: "Super Admin", acao: "Criou nova escolinha: Gol de Placa Academy" },
    { data: "2025-12-25 15:20", usuario: "João Silva", acao: "Alterou plano de Pequenos Craques para Pro" },
    { data: "2025-12-24 11:10", usuario: "Super Admin", acao: "Atualizou configurações financeiras" },
    { data: "2025-12-23 22:05", usuario: "Maria Oliveira", acao: "Removeu superadmin inativo" },
  ];

  const onSubmitSeguranca = async (data: SegurancaFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Configurações de segurança atualizadas:", data);
      toast.success("Configurações de segurança atualizadas com sucesso!");
      resetNovoAdmin({ novoSuperAdminEmail: "" });
    } catch {
      toast.error("Erro ao salvar configurações de segurança");
    }
  };
  //segurança e log
  const adicionarSuperAdmin = () => {
    toast.success("Convite enviado para novo superadmin!");
    resetNovoAdmin({ novoSuperAdminEmail: "" });
  };

  const removerSuperAdmin = (email: string) => {
    toast.success(`Superadmin ${email} removido com sucesso!`);
  };

// Form Backup (8)
  const {
    register: registerBackup,
    handleSubmit: handleSubmitBackup,
    control,
    formState: { isSubmitting: isSubmittingBackup },
  } = useForm<BackupFormData>({
    resolver: zodResolver(backupSchema),
    defaultValues: {
      frequenciaBackup: "semanal",
      ativarBackupAutomatico: true,
    },
  });

  // Mock de histórico de backups 
  const historicoBackups = [
    { data: "2025-12-25 03:00", tipo: "Automático", tamanho: "2.4 GB", status: "Concluído" },
    { data: "2025-12-18 03:00", tipo: "Automático", tamanho: "2.3 GB", status: "Concluído" },
    { data: "2025-12-11 03:00", tipo: "Automático", tamanho: "2.2 GB", status: "Concluído" },
    { data: "2025-12-01 14:30", tipo: "Manual", tamanho: "2.1 GB", status: "Concluído" },
  ];

  const onSubmitBackup = async (data: BackupFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Configurações de backup atualizadas:", data);
      toast.success("Configurações de backup atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações de backup");
    }
  };

  const exportarDados = async (formato: "csv" | "excel") => {
    try {
      await new Promise(r => setTimeout(r, 2000));
      toast.success(`Exportação em ${formato.toUpperCase()} iniciada! Download começará em breve.`);
    } catch {
      toast.error("Erro ao exportar dados");
    }
  };

  const backupManual = async () => {
    try {
      await new Promise(r => setTimeout(r, 3000));
      toast.success("Backup manual iniciado! Você será notificado quando concluir.");
    } catch {
      toast.error("Erro ao iniciar backup manual");
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações da Plataforma</h1>
        <p className="text-gray-600 text-lg mt-2">Gerencie o perfil, identidade visual e planos da FutElite</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="perfil">Perfil do Superadmin</TabsTrigger>
            <TabsTrigger value="identidade">Identidade Visual</TabsTrigger>
            <TabsTrigger value="planos">Planos e Preços</TabsTrigger>
            <TabsTrigger value="financeiro">Pagamentos e Financeiro</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="regras">Regras</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança e Logs</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* ABA 1: Perfil do Superadmin */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Meu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPerfil(onSubmitPerfil)} className="space-y-8">
                {/* Foto do Superadmin */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-32 w-32 ring-4 ring-blue-100">
                    <AvatarImage src={fotoPreview || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-cyan-600 text-white text-3xl font-bold">
                      SA
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fotoInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      Alterar foto
                    </Button>
                    {fotoPreview && (
                      <Button type="button" variant="destructive" size="sm" onClick={removeFoto}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fotoInputRef}
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </div>

                {/* Dados pessoais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" {...registerPerfil("nome")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" disabled {...registerPerfil("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(11) 99999-8888" {...registerPerfil("telefone")} />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingPerfil} className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  {isSubmittingPerfil ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Perfil"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: Identidade Visual da Plataforma */}
        <TabsContent value="identidade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-6 w-6 text-purple-600" />
                Identidade Visual da FutElite
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitIdentidade(onSubmitIdentidade)} className="space-y-8">
                {/* Logo da Plataforma */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-40 w-40 ring-4 ring-purple-100">
                    <AvatarImage src={logoPreview || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-purple-600 to-pink-600 text-white text-4xl font-bold">
                      FE
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      Alterar logo
                    </Button>
                    {logoPreview && (
                      <Button type="button" variant="destructive" size="sm" onClick={removeLogo}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 text-center">Logo da plataforma (recomendado 400x400px, PNG transparente)</p>
                </div>

                {/* Nome da Plataforma */}
                <div className="space-y-2">
                  <Label htmlFor="nomePlataforma">Nome da Plataforma *</Label>
                  <Input id="nomePlataforma" placeholder="FutElite" {...registerIdentidade("nomePlataforma")} />
                </div>

                <Button type="submit" disabled={isSubmittingIdentidade} className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  {isSubmittingIdentidade ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Identidade Visual"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: Planos e Preços (NOVA ETAPA) */}
        <TabsContent value="planos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Planos e Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPlanos(onSubmitPlanos)} className="space-y-8">
                {/* Plano Básico */}
                <div className="space-y-6 p-6 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Badge className="bg-linear-to-r from-green-600 to-emerald-600">Básico</Badge>
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="basicoAtivo">Ativo</Label>
                      <Switch id="basicoAtivo" {...registerPlanos("basicoAtivo")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Preço mensal (R$)</Label>
                      <Input type="number" {...registerPlanos("basicoPreco")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de alunos</Label>
                      <Input placeholder="Ex: 100" {...registerPlanos("basicoAlunos")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teste grátis (dias)</Label>
                      <Input type="number" placeholder="0 para nenhum" {...registerPlanos("basicoTesteDias")} />
                    </div>
                  </div>
                </div>

                {/* Plano Pro */}
                <div className="space-y-6 p-6 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Badge className="bg-linear-to-r from-blue-600 to-cyan-600">Pro</Badge>
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="proAtivo">Ativo</Label>
                      <Switch id="proAtivo" {...registerPlanos("proAtivo")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Preço mensal (R$)</Label>
                      <Input type="number" {...registerPlanos("proPreco")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de alunos</Label>
                      <Input placeholder="Ex: 500" {...registerPlanos("proAlunos")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teste grátis (dias)</Label>
                      <Input type="number" placeholder="0 para nenhum" {...registerPlanos("proTesteDias")} />
                    </div>
                  </div>
                </div>

                {/* Plano Enterprise */}
                <div className="space-y-6 p-6 border rounded-lg bg-purple-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Badge className="bg-linear-to-r from-purple-600 to-pink-600">Enterprise</Badge>
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="enterpriseAtivo">Ativo</Label>
                      <Switch id="enterpriseAtivo" {...registerPlanos("enterpriseAtivo")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Preço mensal (R$)</Label>
                      <Input type="number" {...registerPlanos("enterprisePreco")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de alunos</Label>
                      <Input placeholder="Ilimitado" {...registerPlanos("enterpriseAlunos")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Teste grátis (dias)</Label>
                      <Input type="number" placeholder="0 para nenhum" {...registerPlanos("enterpriseTesteDias")} />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingPlanos} size="lg" className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {isSubmittingPlanos ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando planos...
                    </>
                  ) : (
                    "Salvar Planos e Preços"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: Pagamentos e Financeiro ( ETAPA 3) */}
        <TabsContent value="financeiro">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                Pagamentos e Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFinanceiro(onSubmitFinanceiro)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="chavePix" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Chave PIX da Plataforma *
                    </Label>
                    <Input id="chavePix" placeholder="ex: superadmin@futelite.com" {...registerFinanceiro("chavePix")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxaAdministrativa" className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Taxa Administrativa da FutElite (%) *
                    </Label>
                    <Input id="taxaAdministrativa" type="number" min="0" max="100" placeholder="ex: 10" {...registerFinanceiro("taxaAdministrativa")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasTolerancia" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Dias de Tolerância para Atraso *
                    </Label>
                    <Input id="diasTolerancia" type="number" min="0" placeholder="ex: 15" {...registerFinanceiro("diasTolerancia")} />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingFinanceiro} size="lg" className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  {isSubmittingFinanceiro ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando configurações financeiras...
                    </>
                  ) : (
                    "Salvar Configurações Financeiras"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: Notificações e Templates de E-mail (NOVA ETAPA 4) */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-orange-600" />
                Notificações e Templates de E-mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitNotificacoes(onSubmitNotificacoes)} className="space-y-8">
                {/* E-mail de Suporte e Ativar Notificações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emailSuporte" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-mail de Suporte/Remetente *
                    </Label>
                    <Input id="emailSuporte" type="email" placeholder="suporte@futelite.com" {...registerNotificacoes("emailSuporte")} />
                  </div>

                  <div className="flex items-center gap-4 space-y-0 pt-8">
                    <Label htmlFor="ativarNotificacoesAutomaticas" className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Ativar notificações automáticas
                    </Label>
                    <Switch id="ativarNotificacoesAutomaticas" {...registerNotificacoes("ativarNotificacoesAutomaticas")} />
                  </div>
                </div>

                {/* Templates de E-mail */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="templateBemVindo">Template: Bem-vindo à escolinha</Label>
                    <Textarea
                      id="templateBemVindo"
                      placeholder="Use {nome_escolinha}, {link_login}, {nome_admin}"
                      rows={4}
                      {...registerNotificacoes("templateBemVindo")}
                    />
                    <p className="text-xs text-gray-500">Variáveis: {`{nome_escolinha}, {nome_admin}, {link_login}`}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templatePagamentoAtrasado">Template: Pagamento atrasado</Label>
                    <Textarea
                      id="templatePagamentoAtrasado"
                      placeholder="Use {nome_escolinha}, {data_vencimento}, {valor}"
                      rows={4}
                      {...registerNotificacoes("templatePagamentoAtrasado")}
                    />
                    <p className="text-xs text-gray-500">Variáveis: {`{nome_escolinha}, {data_vencimento}, {valor}`}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateNovoAluno">Template: Novo aluno cadastrado</Label>
                    <Textarea
                      id="templateNovoAluno"
                      placeholder="Use {nome_aluno}, {nome_escolinha}"
                      rows={4}
                      {...registerNotificacoes("templateNovoAluno")}
                    />
                    <p className="text-xs text-gray-500">Variáveis: {`{nome_aluno}, {nome_escolinha}`}</p>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingNotificacoes} size="lg" className="w-full bg-linear-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  {isSubmittingNotificacoes ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando notificações...
                    </>
                  ) : (
                    "Salvar Notificações e Templates"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* ABA 6: Regras da Plataforma (NOVA ETAPA 5) */}
        <TabsContent value="regras">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-indigo-600" />
                Regras da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRegras(onSubmitRegras)} className="space-y-8">
                {/* Idade mínima e máxima */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="idadeMinima" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Idade Mínima para Alunos (anos) *
                    </Label>
                    <Input id="idadeMinima" type="number" min="0" placeholder="ex: 5" {...registerRegras("idadeMinima")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idadeMaxima" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Idade Máxima para Alunos (anos) *
                    </Label>
                    <Input id="idadeMaxima" type="number" min="0" placeholder="ex: 17" {...registerRegras("idadeMaxima")} />
                  </div>
                </div>

                {/* Categorias padrão */}
                <div className="space-y-2">
                  <Label htmlFor="categoriasPadrao" className="flex items-center gap-2">
                    <Badge className="bg-indigo-600">Categorias</Badge>
                    Categorias Padrão (separadas por vírgula)
                  </Label>
                  <Textarea
                    id="categoriasPadrao"
                    placeholder="Sub-7, Sub-9, Sub-11, Sub-13, Sub-15, Sub-17"
                    rows={3}
                    {...registerRegras("categoriasPadrao")}
                  />
                  <p className="text-xs text-gray-500">Essas categorias aparecerão como padrão ao criar alunos</p>
                </div>

                {/* Suspensão automática */}
                <div className="space-y-6 p-6 border rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-6 w-6" />
                      Suspensão Automática por Atraso
                    </h3>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="ativarSuspensaoAutomatica">Ativar</Label>
                      <Switch id="ativarSuspensaoAutomatica" {...registerRegras("ativarSuspensaoAutomatica")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diasAtrasoSuspensao" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Suspender escolinha após quantos dias de atraso? *
                    </Label>
                    <Input id="diasAtrasoSuspensao" type="number" min="1" placeholder="ex: 30" {...registerRegras("diasAtrasoSuspensao")} />
                    <p className="text-sm text-red-700">Após esse período, a escolinha será suspensa automaticamente até regularizar o pagamento.</p>
                  </div>
                </div>

                <Button type="submit" disabled={isSubmittingRegras} size="lg" className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  {isSubmittingRegras ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando regras...
                    </>
                  ) : (
                    "Salvar Regras da Plataforma"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 7: Segurança e Logs (NOVA ETAPA 6) */}
        <TabsContent value="seguranca">
          <div className="space-y-8">
            {/* Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSeguranca(onSubmitSeguranca)} className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div>
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Autenticação em 2 Fatores (2FA) Obrigatória
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">Todos os superadmins devem usar 2FA para acessar a plataforma</p>
                    </div>
                    <Switch {...registerSeguranca("ativar2FAObrigatorio")} />
                  </div>

                  {/* Adicionar novo superadmin */}
                  <div className="space-y-4 p-6 border rounded-lg bg-blue-50">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Adicionar Novo Superadmin
                    </h3>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="email@novo-superadmin.com"
                        {...registerSeguranca("novoSuperAdminEmail")}
                      />
                      <Button type="button" onClick={adicionarSuperAdmin} className="bg-blue-600 hover:bg-blue-700">
                        Enviar Convite
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmittingSeguranca} className="bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                    {isSubmittingSeguranca ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando segurança...
                      </>
                    ) : (
                      "Salvar Configurações de Segurança"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de Superadmins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-gray-600" />
                  Superadmins Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outrosSuperAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.nome}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.ultimoAcesso}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="destructive" onClick={() => removerSuperAdmin(admin.email)}>
                            <UserX className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Log de Atividades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-purple-600" />
                  Log de Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logAtividades.map((log, i) => (
                      <TableRow key={i}>
                        <TableCell>{log.data}</TableCell>
                        <TableCell className="font-medium">{log.usuario}</TableCell>
                        <TableCell>{log.acao}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="space-y-8">
            {/* Configurações de Backup Automático */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-teal-600" />
                  Backup Automático
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBackup(onSubmitBackup)} className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-teal-50">
                    <div>
                      <Label className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Ativar Backup Automático
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">Backups regulares dos dados da plataforma</p>
                    </div>
                    <Switch {...registerBackup("ativarBackupAutomatico")} />
                  </div>

                  <div className="space-y-2">
                    <Label>Frequência do Backup</Label>
                    <Controller
                      name="frequenciaBackup"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="diario">Diário (todas as noites às 03:00)</SelectItem>
                            <SelectItem value="semanal">Semanal (toda segunda às 03:00)</SelectItem>
                            <SelectItem value="mensal">Mensal (dia 1 às 03:00)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmittingBackup} className="bg-linear-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700">
                      {isSubmittingBackup ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Configurações de Backup"
                      )}
                    </Button>

                    <Button type="button" onClick={backupManual} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                      <Database className="mr-2 h-4 w-4" />
                      Iniciar Backup Manual Agora
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Exportação de Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-6 w-6 text-blue-600" />
                  Exportação de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">Exporte todos os dados da plataforma para análise ou migração</p>
                  <div className="flex gap-4">
                    <Button onClick={() => exportarDados("csv")} className="bg-blue-600 hover:bg-blue-700">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar como CSV
                    </Button>
                    <Button onClick={() => exportarDados("excel")} className="bg-green-600 hover:bg-green-700">
                      <Download className="mr-2 h-4 w-4" />
                      Exportar como Excel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Backups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-gray-600" />
                  Histórico de Backups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historicoBackups.map((backup, i) => (
                      <TableRow key={i}>
                        <TableCell>{backup.data}</TableCell>
                        <TableCell>
                          <Badge variant={backup.tipo === "Automático" ? "secondary" : "outline"}>
                            {backup.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{backup.tamanho}</TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">{backup.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;