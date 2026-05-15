/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/configuracoes/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import {
  Loader2,
  Camera,
  Trash2,
  Building2,
  Activity,
  Trophy,
  DollarSign,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import api from "@/src/lib/api";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import dynamic from 'next/dynamic';

const formatarReal = (valor: number | null | undefined): string => {
  if (valor == null || isNaN(valor)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
};

const ImageUploader = dynamic(
  () => import("@/src/components/ImageUploader"), // Ajuste o caminho se necessário
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6" />
        <p className="text-gray-500">Carregando uploader de imagem...</p>
      </div>
    ),
  }
);

/// Schemas Zod
const geralSchema = z.object({
  nomeEscolinha: z.string().min(3, "Nome da escolinha é obrigatório"),
  mensagemBoasVindas: z.string().optional(),
});
// Schema Zod para valores
const valoresSchema = z.object({
  valorMensalidadeFutebol: z.number().positive("Valor deve ser positivo"),
  diaVencimento: z.number().int().min(1).max(31, "Dia inválido"),
  valorMensalidadeCrossfit: z.number().optional(),
});


const aulasExtrasSchema = z.object({
  ativarAulasExtras: z.boolean(),
  aulas: z.array(
    z.object({
      id: z.string().optional(),
      nome: z.string().min(3),
      valor: z.number().positive(),
      duracao: z.string().min(1),
      descricao: z.string().optional(),
    })
  ).optional().default([]),
  editNome: z.string().optional(),
  editValor: z.number().optional(),
  editDuracao: z.string().optional(),
  editDescricao: z.string().optional(),
});

const crossfitSchema = z.object({
  ativarCrossfit: z.boolean(),
  mostrarNavbar: z.boolean().default(false),
  mostrarSidebar: z.boolean().default(false),
  nomeServicoCrossfit: z.string().min(3, "Nome do serviço obrigatório").optional(),
  valorMensalidadeCrossfit: z.number().positive("Valor obrigatório").optional(),
  professorCrossfitId: z.string().uuid("Professor obrigatório").optional(),
  limiteVagasCrossfit: z.number().int().positive().optional().default(15),
  descricao: z.string().optional(), // ← novo campo (opcional)
});

const pagamentoSchema = z.object({
  gateway: z.enum(["stripe", "pagseguro", "pix", "nenhum"]),
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  pagseguroEmail: z.string().email().optional(),
  pagseguroToken: z.string().optional(),
  pixChave: z.string().optional(),
  pixNomeTitular: z.string().optional(),
  pixBanco: z.string().optional(),
}).refine(
  (data) => {
    if (data.gateway === "stripe") return !!data.stripePublishableKey && !!data.stripeSecretKey;
    if (data.gateway === "pagseguro") return !!data.pagseguroEmail && !!data.pagseguroToken;
    if (data.gateway === "pix") return !!data.pixChave && !!data.pixNomeTitular;
    return true;
  },
  { message: "Preencha todos os campos obrigatórios do gateway selecionado", path: ["gateway"] }
);

type GeralFormData = z.infer<typeof geralSchema>;
type ValoresForm = z.infer<typeof valoresSchema>;
type AulasExtrasForm = z.infer<typeof aulasExtrasSchema>;
type CrossfitForm = z.infer<typeof crossfitSchema>;
type PagamentoForm = z.infer<typeof pagamentoSchema>;
type AulasExtrasInput = z.infer<typeof aulasExtrasSchema>;

export default function ConfiguracoesAdminPage() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [crossfitBanner, setCrossfitBanner] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const crossfitInputRef = useRef<HTMLInputElement>(null);
  const [professores, setProfessores] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { refreshConfig } = useEscolinhaConfig();

// Novos estados para o formulário de nova aula extra
const [novaAulaNome, setNovaAulaNome] = useState("");
const [novaAulaValor, setNovaAulaValor] = useState(0);
const [novaAulaDuracao, setNovaAulaDuracao] = useState("");
const [novaAulaDescricao, setNovaAulaDescricao] = useState("");

//Editar aula extra por Id
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingAula, setEditingAula] = useState<any | null>(null); // tipo da aula

  // Formulários
  const geralForm = useForm<GeralFormData>({
    resolver: zodResolver(geralSchema),
  });

  //Valor e Vencimento aula futebol
const valoresForm = useForm<ValoresForm>({
  resolver: zodResolver(valoresSchema),
  defaultValues: {
    valorMensalidadeFutebol: 150.00,
    valorMensalidadeCrossfit: 150.00,
    diaVencimento: 10,
  },
});

const aulasExtrasForm = useForm<AulasExtrasForm>({
  resolver: zodResolver(aulasExtrasSchema)as any,
  defaultValues: {
    ativarAulasExtras: false,
    aulas: [],
    editNome: "",
    editValor: 0,
    editDuracao: "",
    editDescricao: "",
  },
});

  const crossfitForm = useForm<CrossfitForm>({
    resolver: zodResolver(crossfitSchema) as any,
    defaultValues: {
      ativarCrossfit: false,
      mostrarNavbar: false,
      mostrarSidebar: false,
      nomeServicoCrossfit: "",
      valorMensalidadeCrossfit: 0,
      professorCrossfitId: "",
      limiteVagasCrossfit: 15,
      descricao: "",
    }
  });

  const pagamentoForm = useForm<PagamentoForm>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: { gateway: "nenhum" },
  });

  const gatewaySelecionado = pagamentoForm.watch("gateway");
  const ativarCrossfit = crossfitForm.watch("ativarCrossfit");

  // Carrega dados reais do backend
useEffect(() => {
  const loadConfig = async () => {
    try {
      setIsLoading(true);

      // 1. Carrega as configurações gerais da escolinha
      const resConfig = await api.get("/tenant/config/escolinha");
      const config = resConfig.data.data || {};

    //  console.log("📥 Configuração carregada do banco:", config); // Debug

      geralForm.reset({
        nomeEscolinha: config.nome || "Escolinha",
        mensagemBoasVindas: config.mensagemBoasVindas || config.mensagem_boas_vindas || "", // aceita variações
      });

      // Força atualização do campo (backup)
      geralForm.setValue("mensagemBoasVindas", config.mensagemBoasVindas || "");

      // Carrega professores (funcionários treinadores)
      try {
        const resProf = await api.get("/tenant/funcionarios"); // ajuste rota se for diferente
        setProfessores(resProf.data.data || []);
        console.log("Professores carregados:", resProf.data.data?.length || 0);
      } catch (err) {
        console.error("Erro ao carregar professores:", err);
        toast.error("Falha ao carregar lista de professores");
        setProfessores([]);
      }

      // Carrega valores (mensalidade futebol, crossfit, vencimento)
      valoresForm.reset({
        valorMensalidadeFutebol: config.valorMensalidadeFutebol ?? 150.00,
        valorMensalidadeCrossfit: config.valorMensalidadeCrossfit ?? 150.00,
        diaVencimento: config.diaVencimentoMensalidade ?? 10,
      });

      // Carrega configuração CrossFit e turma padrão
      let turmaPadrao = null;
      try {
        const resTurmas = await api.get("/tenant/crossfit/turmas");
        const turmas = resTurmas.data.data || [];
        turmaPadrao = turmas.find((t: any) => 
          t.nome.includes("Padrão") || t.nome === "CrossFit Padrão" || turmas.length === 1
        );

        crossfitForm.reset({
          ativarCrossfit: config.crossfitAtivo ?? false,
          mostrarNavbar: config.mostrarCrossfitNavbar ?? false,
          mostrarSidebar: config.mostrarCrossfitSidebar ?? false,
          nomeServicoCrossfit: turmaPadrao?.nome || config.nomeServicoCrossfit || "",
          valorMensalidadeCrossfit: turmaPadrao?.valorMensalidade || config.valorMensalidadeCrossfit || 0,
          professorCrossfitId: turmaPadrao?.professorId || config.professorCrossfitId || "",
          limiteVagasCrossfit: turmaPadrao?.vagasMax || config.limiteVagasCrossfit || 15,
        });

        console.log("Turma padrão CrossFit encontrada:", turmaPadrao ? "Sim" : "Não", turmaPadrao);
      } catch (errTurma) {
        console.error("Erro ao carregar turmas CrossFit:", errTurma);
        // Fallback se não conseguir carregar turmas
        crossfitForm.reset({
          ativarCrossfit: config.crossfitAtivo ?? false,
          mostrarNavbar: config.mostrarCrossfitNavbar ?? false,
          mostrarSidebar: config.mostrarCrossfitSidebar ?? false,
          nomeServicoCrossfit: config.nomeServicoCrossfit || "",
          valorMensalidadeCrossfit: config.valorMensalidadeCrossfit || 0,
          professorCrossfitId: config.professorCrossfitId || "",
          limiteVagasCrossfit: config.limiteVagasCrossfit || 15,
        });
      }

      aulasExtrasForm.reset({
        ativarAulasExtras: config.aulasExtrasAtivas ?? false,
      });

      pagamentoForm.reset({
        gateway: config.gatewayPagamento || "nenhum",
        stripePublishableKey: config.stripePublishableKey || "",
        stripeSecretKey: config.stripeSecretKey || "",
        pagseguroEmail: config.pagseguroEmail || "",
        pagseguroToken: config.pagseguroToken || "",
        pixChave: config.pixChave || "",
        pixNomeTitular: config.pixNomeTitular || "",
        pixBanco: config.pixBanco || "",
      });

      if (config.logoUrl) setLogoPreview(config.logoUrl);
      if (config.crossfitBannerUrl) setCrossfitBanner(config.crossfitBannerUrl);

      // Carrega aulas extras separadamente
      try {
        const resAulas = await api.get("/tenant/config/aulas-extras");
        const aulasData = resAulas.data.data || [];
        aulasExtrasForm.setValue("aulas", aulasData);
        console.log("Aulas extras carregadas:", aulasData.length);
      } catch (errAulas) {
        console.error("Erro ao carregar aulas extras:", errAulas);
        toast.error("Falha ao carregar lista de aulas extras");
        aulasExtrasForm.setValue("aulas", []);
      }

      console.log("CONFIG VALORES DO BANCO:", {
        valorMensalidadeFutebol: config.valorMensalidadeFutebol,
        valorMensalidadeCrossfit: config.valorMensalidadeCrossfit,
        diaVencimento: config.diaVencimentoMensalidade,
      });

      toast.success("Configurações carregadas!");
    } catch (err) {
      console.error("Erro ao carregar configs:", err);
      toast.error("Falha ao carregar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  loadConfig();
}, 
[geralForm, valoresForm, aulasExtrasForm, crossfitForm, pagamentoForm]);

  // Salvamentos
  const salvarGeral = async (data: GeralFormData) => {
    setIsSaving(true);
    try {
      await api.put("/tenant/config/geral", data);
      toast.success("Geral salvo!");
      await refreshConfig(); // atualiza navbar/sidebar
    } catch (err: any) {
      toast.error("Erro ao salvar geral", { description: err.response?.data?.error });
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar valore aulas e data
  const salvarValores = async (data: ValoresForm) => {
  setIsSaving(true);
  try {
    await api.put("/tenant/config/valores", data);
    toast.success("Valores salvos com sucesso!");
    await refreshConfig(); // atualiza navbar/sidebar se necessário
  } catch (err: any) {
    toast.error("Erro ao salvar valores", {
      description: err.response?.data?.error || "Tente novamente",
    });
  } finally {
    setIsSaving(false);
  }
};
  
//SALVAR AULAS EXTRAS
/*const salvarAulasExtras = async () => {
  setIsSaving(true);
  try {
    const ativar = aulasExtrasForm.getValues("ativarAulasExtras");
    await api.put("/tenant/config/aulas-extras/activation", { ativarAulasExtras: ativar });
    toast.success("Ativação atualizada com sucesso!");
    await refreshConfig();
  } catch (err: any) {
    toast.error("Erro ao atualizar ativação", {
      description: err.response?.data?.error || "Tente novamente",
    });
  } finally {
    setIsSaving(false);
  }
};*/

//Modal Editar Aula Esxtra
const openEditModal = (aula: any) => {
  setEditingAula(aula);
  aulasExtrasForm.setValue("editNome", aula.nome);
  aulasExtrasForm.setValue("editValor", aula.valor);
  aulasExtrasForm.setValue("editDuracao", aula.duracao);
  aulasExtrasForm.setValue("editDescricao", aula.descricao || "");
  setIsEditModalOpen(true);
};

// Função para salvar edição
  const salvarEdicao = async () => {
    if (!editingAula?.id) return;

    try {
      const payload = {
        id: editingAula.id,
        nome: aulasExtrasForm.getValues("editNome"),
        valor: aulasExtrasForm.getValues("editValor"),
        duracao: aulasExtrasForm.getValues("editDuracao"),
        descricao: aulasExtrasForm.getValues("editDescricao") || undefined,
      };
      console.log("PAYLOAD DE EDIÇÃO ENVIADO:", payload);
      await api.put(`/tenant/config/aulas-extras/${editingAula.id}`, payload);
      toast.success("Aula atualizada com sucesso!");

      // Recarrega lista
      const res = await api.get("/tenant/config/aulas-extras");
      aulasExtrasForm.setValue("aulas", res.data.data || []);

      setIsEditModalOpen(false);
      setEditingAula(null);
    } catch (err: any) {
      toast.error("Erro ao atualizar aula", {
        description: err.response?.data?.error || "Tente novamente",
      });
    }
  };

//Salvar aulas crossfit
const salvarCrossfit = async () => {
  setIsSaving(true);
  try {
    const data = crossfitForm.getValues();

    // Validação manual (impede envio de payload inválido)
    if (!data.nomeServicoCrossfit?.trim()) {
      toast.error("Preencha o Nome do serviço");
      return;
    }
    if (!data.valorMensalidadeCrossfit || data.valorMensalidadeCrossfit <= 0) {
      toast.error("Valor mensal deve ser maior que 0");
      return;
    }
    if (!data.professorCrossfitId) {
      toast.error("Selecione um Professor responsável");
      return;
    }

    // Payload com valores garantidos (nunca undefined)
    const payload = {
      nome: data.nomeServicoCrossfit.trim(),
      valorMensalidade: data.valorMensalidadeCrossfit,
      professorId: data.professorCrossfitId,
      vagasMax: data.limiteVagasCrossfit ?? 15,
      horario: "Horário padrão (editável na gestão)", // opcional
      descricao: data.descricao?.trim() || undefined,
    };

    console.log("PAYLOAD ENVIADO PARA CROSSFIT:", JSON.stringify(payload, null, 2));

    // Verifica se já existe turma padrão
    const resTurmas = await api.get("/tenant/crossfit/turmas");
    const turmas = resTurmas.data.data || [];
    const turmaPadrao = turmas.find((t: any) => t.nome.includes("Padrão") || t.nome === payload.nome);

    if (turmaPadrao) {
      // Atualiza
      await api.put(`/tenant/crossfit/turmas/${turmaPadrao.id}`, payload);
      toast.success("Turma padrão atualizada!");
    } else {
      // Cria
      await api.post("/tenant/crossfit/turmas", payload);
      toast.success("Turma padrão criada!");
    }

    await refreshConfig();

    // Recarrega o form com os valores salvos
    const resAtualizado = await api.get("/tenant/crossfit/turmas");
    const turmasAtualizadas = resAtualizado.data.data || [];
    const turmaAtual = turmasAtualizadas.find((t: any) => t.nome === payload.nome);
    if (turmaAtual) {
      crossfitForm.reset({
        ...data,
        nomeServicoCrossfit: turmaAtual.nome,
        valorMensalidadeCrossfit: turmaAtual.valorMensalidade,
        professorCrossfitId: turmaAtual.professorId,
        limiteVagasCrossfit: turmaAtual.vagasMax,
      });
    }
  } catch (err: any) {
    console.error("ERRO AO SALVAR CROSSFIT:", err.response?.data || err);
    const msg = err.response?.data?.details?.map((d: any) => d.message).join(", ") || err.response?.data?.error || "Erro ao salvar configuração";
    toast.error("Erro ao salvar CrossFit", { description: msg });
  } finally {
    setIsSaving(false);
  }
};

  const salvarPagamento = async (data: PagamentoForm) => {
    setIsSaving(true);
    try {
      await api.put("/tenant/config/pagamentos", data);
      toast.success("Pagamentos salvo!");
      await refreshConfig();
    } catch (err: any) {
      toast.error("Erro ao salvar pagamentos");
    } finally {
      setIsSaving(false);
    }
  };

  // Uploads
  const handleLogoUpload = async () => {
    const file = logoInputRef.current?.files?.[0];
    if (!file) return toast.warning("Selecione uma imagem");

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await api.post("/tenant/config/logo", formData);
      setLogoPreview(res.data.data.logoUrl);
      toast.success("Logo atualizada!");
      await refreshConfig();
    } catch (err: any) {
      toast.error("Erro no upload da logo");
    }
  };

  const handleCrossfitBannerUpload = async () => {
    const file = crossfitInputRef.current?.files?.[0];
    if (!file) return toast.warning("Selecione uma imagem");

    const formData = new FormData();
    formData.append("banner", file);

    try {
      const res = await api.post("/tenant/config/crossfit-banner", formData);
      setCrossfitBanner(res.data.data.crossfitBannerUrl);
      toast.success("Banner atualizado!");
      await refreshConfig();
    } catch (err: any) {
      toast.error("Erro no upload do banner");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <span className="ml-4 text-xl">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações da Escolinha</h1>
        <p className="text-gray-600 text-lg mt-2">Personalize sua escolinha e ative funcionalidades extras</p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="valores">Valores e Cobrança</TabsTrigger>
          <TabsTrigger value="aulasextras">Aulas Extras</TabsTrigger>
          <TabsTrigger value="crossfit">CrossFit</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        {/* ABA GERAL */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Informações Gerais
              </CardTitle>
            </CardHeader>

            <CardContent>
             <form onSubmit={geralForm.handleSubmit(salvarGeral)} className="space-y-8">
        {/* Logo */}
        <div suppressHydrationWarning={true} className="flex justify-center py-6 border-b">
          <ImageUploader
            currentImageUrl={logoPreview}
            entityName={geralForm.watch("nomeEscolinha") || "Escolinha"}
            uploadEndpoint="/tenant/upload/escolinha"
            deleteEndpoint="/tenant/upload/escolinha"
            onUploadSuccess={(url) => setLogoPreview(url)}
            onRemove={() => setLogoPreview(null)}
            size="lg"
          />
        </div>

        <div className="space-y-2">
          <Label>Nome da Escolinha</Label>
          <Input {...geralForm.register("nomeEscolinha")} />
        </div>

        <div className="space-y-2">
          <Label>Mensagem de Boas-vindas</Label>
          <Textarea 
            rows={6} 
            placeholder="Bem-vindo à nossa escolinha! Aqui você encontra..." 
            {...geralForm.register("mensagemBoasVindas")} 
          />
          <p className="text-xs text-gray-500">
            Esta mensagem aparecerá para os responsáveis e alunos no login.
          </p>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={geralForm.formState.isSubmitting || isSaving}
          >
            {geralForm.formState.isSubmitting || isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Geral"
            )}
          </Button>
        </div>
      </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA VALORES */}
        <TabsContent value="valores">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Valores dos Serviços
              </CardTitle>
              <CardDescription>Configure os valores de mensalidade e vencimento</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Mensalidade Futebol</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatarReal(valoresForm.watch("valorMensalidadeFutebol"))}
                  </div>
                    <Input
                      type="number"
                      step="0.01"
                      {...valoresForm.register("valorMensalidadeFutebol", { valueAsNumber: true })}
                      className="text-xl font-bold h-10"
                    />
                  {valoresForm.formState.errors.valorMensalidadeFutebol && (
                    <p className="text-red-500 text-sm">
                      {valoresForm.formState.errors.valorMensalidadeFutebol.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Dia de Vencimento</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    {...valoresForm.register("diaVencimento", { valueAsNumber: true })}
                    className="w-20 text-center h-10"
                  />
                  {valoresForm.formState.errors.diaVencimento && (
                    <p className="text-red-500 text-sm">
                      {valoresForm.formState.errors.diaVencimento.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-green-600"
                  onClick={valoresForm.handleSubmit(salvarValores)}
                  disabled={valoresForm.formState.isSubmitting || isSaving}
                >
                  {valoresForm.formState.isSubmitting || isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Valores"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      {/* ABA AULAS EXTRAS */}
      <TabsContent value="aulasextras">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Aulas Extras
            </CardTitle>
            <CardDescription>Ative e gerencie aulas extras para alunos e pais</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Switch de ativação */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
              <div>
                <Label className="text-lg font-semibold">Ativar Aulas Extras</Label>
                <p className="text-sm text-gray-600">Permitir solicitação e cadastro de aulas individuais</p>
              </div>
              <Switch
                checked={aulasExtrasForm.watch("ativarAulasExtras")}
                onCheckedChange={async (checked) => {
                  aulasExtrasForm.setValue("ativarAulasExtras", checked);
                  try {
                    await api.put("/tenant/config/aulas-extras/activation", { ativarAulasExtras: checked });
                    await refreshConfig();
                    toast.success(`Aulas Extras ${checked ? "ativadas" : "desativadas"}`);
                  } catch (err: any) {
                    toast.error("Erro ao atualizar ativação");
                    aulasExtrasForm.setValue("ativarAulasExtras", !checked); // reverte se falhar
                  }
                }}
              />
            </div>

            {/* Conteúdo só aparece se ativado */}
            {aulasExtrasForm.watch("ativarAulasExtras") && (
              <div className="space-y-6">
                {/* Formulário para adicionar nova aula */}
                <Card className="bg-gray-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Adicionar Nova Aula Extra</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div className="md:col-span-2">
                        <Label>Nome da aula</Label>
                        <Input
                          placeholder="ex: Condicionamento Físico"
                          value={novaAulaNome}
                          onChange={(e) => setNovaAulaNome(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          placeholder="80"
                          step="0.01"
                          value={novaAulaValor}
                          onChange={(e) => setNovaAulaValor(Number(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <Label>Duração</Label>
                        <Select value={novaAulaDuracao} onValueChange={setNovaAulaDuracao}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30 min">30 min</SelectItem>
                            <SelectItem value="45 min">45 min</SelectItem>
                            <SelectItem value="60 min">60 min</SelectItem>
                            <SelectItem value="90 min">90 min</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 lg:col-span-4">
                        <Label>Descrição</Label>
                        <Textarea
                          placeholder="Detalhes da aula, público-alvo, objetivos..."
                          rows={2}
                          value={novaAulaDescricao}
                          onChange={(e) => setNovaAulaDescricao(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                        <Button
                          type="button"
                          onClick={async () => {
                            if (!novaAulaNome.trim() || novaAulaValor <= 0 || !novaAulaDuracao.trim()) {
                              toast.error("Preencha nome, valor (>0) e duração");
                              return;
                            }

                            try {
                              const payload = {
                                nome: novaAulaNome.trim(),
                                valor: novaAulaValor,
                                duracao: novaAulaDuracao.trim(),
                                descricao: novaAulaDescricao.trim() || undefined,
                              };

                              await api.post("/tenant/config/aulas-extras", payload);
                              toast.success("Aula extra criada com sucesso!");

                              // Limpa os campos
                              setNovaAulaNome("");
                              setNovaAulaValor(0);
                              setNovaAulaDuracao("");
                              setNovaAulaDescricao("");

                              // Recarrega lista do backend (com IDs reais)
                              const res = await api.get("/tenant/config/aulas-extras");
                              aulasExtrasForm.setValue("aulas", res.data.data || []);
                            } catch (err: any) {
                              console.error("Erro ao criar aula:", err);
                              toast.error("Erro ao criar aula extra", {
                                description: err.response?.data?.error || "Verifique o console",
                              });
                            }
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          Adicionar Aula
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de aulas cadastradas */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Aulas Cadastradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aula</TableHead>
                          <TableHead>Valor (R$)</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {aulasExtrasForm.watch("aulas")?.map((aula) => (
                          <TableRow key={aula.id}>
                            <TableCell className="font-medium">{aula.nome}</TableCell>
                            <TableCell>{aula.valor.toFixed(2)}</TableCell>
                            <TableCell>{aula.duracao}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {aula.descricao || "-"}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditModal(aula)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  if (!confirm("Tem certeza que deseja excluir esta aula?")) return;

                                  try {
                                    await api.delete(`/tenant/config/aulas-extras/${aula.id}`);
                                    toast.success("Aula excluída com sucesso");

                                    // Recarrega lista
                                    const res = await api.get("/tenant/config/aulas-extras");
                                    aulasExtrasForm.setValue("aulas", res.data.data || []);
                                  } catch (err: any) {
                                    toast.error("Erro ao excluir aula", {
                                      description: err.response?.data?.error || "Tente novamente",
                                    });
                                  }
                                }}
                              >
                                Excluir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}

                        {aulasExtrasForm.watch("aulas")?.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                              Nenhuma aula extra cadastrada ainda
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Botão salvar ativação (opcional, pode remover se não quiser) */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={async () => {
                      const ativar = aulasExtrasForm.getValues("ativarAulasExtras");
                      try {
                        await api.put("/tenant/config/aulas-extras/activation", { ativarAulasExtras: ativar });
                        toast.success("Ativação atualizada!");
                        await refreshConfig();
                      } catch (err) {
                        toast.error("Erro ao atualizar ativação");
                      }
                    }}
                    disabled={isSaving}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Salvar Ativação
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de edição */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Aula Extra</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="editNome"
                  className="col-span-3"
                  {...aulasExtrasForm.register("editNome")}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editValor" className="text-right">
                  Valor (R$)
                </Label>
                <Input
                  id="editValor"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  {...aulasExtrasForm.register("editValor", { valueAsNumber: true })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDuracao" className="text-right">
                  Duração
                </Label>
                <Select {...aulasExtrasForm.register("editDuracao")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 min">30 min</SelectItem>
                    <SelectItem value="45 min">45 min</SelectItem>
                    <SelectItem value="60 min">60 min</SelectItem>
                    <SelectItem value="90 min">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDescricao" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="editDescricao"
                  className="col-span-3"
                  rows={3}
                  {...aulasExtrasForm.register("editDescricao")}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarEdicao}>Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
      </TabsContent>

        {/* ABA CROSSFIT */}
      <TabsContent value="crossfit">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-red-600" />
              CrossFit para Pais e Comunidade
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Switch de ativação */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
              <div>
                <Label className="text-lg font-semibold">Ativar CrossFit</Label>
                <p className="text-sm text-gray-600">Ofereça aulas para adultos</p>
              </div>
              <Switch
                checked={crossfitForm.watch("ativarCrossfit")}
                onCheckedChange={async (checked) => {
                  crossfitForm.setValue("ativarCrossfit", checked);
                  try {
                    await api.put("/tenant/config/crossfit/activation", { ativarCrossfit: checked });
                    await refreshConfig();
                    toast.success(`CrossFit ${checked ? "ativado" : "desativado"}`);
                  } catch (err: any) {
                    toast.error("Erro ao atualizar ativação");
                    crossfitForm.setValue("ativarCrossfit", !checked); // reverte se falhar
                  }
                }}
              />
            </div>

            {crossfitForm.watch("ativarCrossfit") && (
              <div className="space-y-8">
                {/* Banner */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-40 w-40 ring-4 ring-red-100">
                    <AvatarImage src={crossfitBanner || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-red-600 to-orange-600 text-white text-4xl font-bold">
                      CF
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => crossfitInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />
                      Alterar banner
                    </Button>
                    {crossfitBanner && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => setCrossfitBanner(null)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>

                  <input type="file" accept="image/*" ref={crossfitInputRef} onChange={handleCrossfitBannerUpload} className="hidden" />
                </div>

                {/* Campos da turma padrão */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nome do serviço</Label>
                    <Input
                      placeholder="ex: CrossFit FutElite Pais"
                      {...crossfitForm.register("nomeServicoCrossfit")}
                    />
                    {crossfitForm.formState.errors.nomeServicoCrossfit && (
                      <p className="text-red-500 text-sm">
                        {crossfitForm.formState.errors.nomeServicoCrossfit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Mensalidade CrossFit</Label>
                      <div className="text-2xl font-bold text-green-600">
                        {formatarReal(valoresForm.watch("valorMensalidadeCrossfit"))}
                      </div>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="ex: 149"
                          {...crossfitForm.register("valorMensalidadeCrossfit", { valueAsNumber: true })}
                        />
                    {crossfitForm.formState.errors.valorMensalidadeCrossfit && (
                      <p className="text-red-500 text-sm">
                        {crossfitForm.formState.errors.valorMensalidadeCrossfit.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Professor responsável</Label>
                    <Select
                      value={crossfitForm.watch("professorCrossfitId") || ""}
                      onValueChange={(value) => crossfitForm.setValue("professorCrossfitId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o professor" />
                      </SelectTrigger>
                      <SelectContent>
                        {professores.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id}>
                            {prof.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {crossfitForm.formState.errors.professorCrossfitId && (
                      <p className="text-red-500 text-sm">
                        {crossfitForm.formState.errors.professorCrossfitId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Limite de vagas</Label>
                    <Input
                      type="number"
                      placeholder="ex: 15"
                      {...crossfitForm.register("limiteVagasCrossfit", { valueAsNumber: true })}
                    />
                    {crossfitForm.formState.errors.limiteVagasCrossfit && (
                      <p className="text-red-500 text-sm">
                        {crossfitForm.formState.errors.limiteVagasCrossfit.message}
                      </p>
                    )}
                  </div>

                  {/* Novo campo: Descrição */}
                  <div className="md:col-span-2 space-y-2">
                    <Label>Descrição da turma</Label>
                    <Textarea
                      placeholder="Detalhes da turma, foco, público-alvo, objetivos..."
                      rows={3}
                      {...crossfitForm.register("descricao")}
                    />
                    {crossfitForm.formState.errors.descricao && (
                      <p className="text-red-500 text-sm">
                        {crossfitForm.formState.errors.descricao.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botão salvar */}
            <div className="flex justify-end">
              <Button
                onClick={salvarCrossfit}
                disabled={!crossfitForm.formState.isDirty || isSaving}
                className="bg-green-600"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Configuração CrossFit"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

        {/* ABA PAGAMENTOS */}
        <TabsContent value="pagamentos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                Configuração de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={pagamentoForm.handleSubmit(salvarPagamento)} className="space-y-8">
                <div className="space-y-4">
                  <Label>Gateway</Label>
                  <Select value={gatewaySelecionado} onValueChange={(v) => pagamentoForm.setValue("gateway", v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="pagseguro">PagSeguro</SelectItem>
                      <SelectItem value="pix">PIX Manual</SelectItem>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos condicionais */}
                {gatewaySelecionado === "stripe" && (
                  <div className="p-6 bg-blue-50 rounded-lg border space-y-4">
                    <h3 className="font-bold">Stripe</h3>
                    <Input {...pagamentoForm.register("stripePublishableKey")} placeholder="Publishable Key" />
                    <Input {...pagamentoForm.register("stripeSecretKey")} type="password" placeholder="Secret Key" />
                  </div>
                )}

                {gatewaySelecionado === "pagseguro" && (
                  <div className="p-6 bg-green-50 rounded-lg border space-y-4">
                    <h3 className="font-bold">PagSeguro</h3>
                    <Input {...pagamentoForm.register("pagseguroEmail")} placeholder="Email" />
                    <Input {...pagamentoForm.register("pagseguroToken")} type="password" placeholder="Token" />
                  </div>
                )}

                {gatewaySelecionado === "pix" && (
                  <div className="p-6 bg-purple-50 rounded-lg border space-y-4">
                    <h3 className="font-bold">PIX</h3>
                    <Input {...pagamentoForm.register("pixChave")} placeholder="Chave PIX" />
                    <Input {...pagamentoForm.register("pixNomeTitular")} placeholder="Nome do Titular" />
                    <Input {...pagamentoForm.register("pixBanco")} placeholder="Banco (opcional)" />
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving} className="bg-green-600">
                    {isSaving ? "Salvando..." : "Salvar Pagamentos"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}