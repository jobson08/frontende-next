// src/app/dashboarduser/admin-dashboard/configuracoes/page.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { toast } from "sonner";
import { Loader2, Camera, Trash2, Palette, Building2, Activity, Trophy, Users, Bell, DollarSign, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Switch } from "@/src/components/ui/switch";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";

// Schemas simples (podem ser expandidos depois)
const geralSchema = z.object({
  nomeEscolinha: z.string().min(3),
  mensagemBoasVindas: z.string().optional(),
});

const aulasExtrasSchema = z.object({
  ativarAulasExtras: z.boolean(),
});

const crossfitSchema = z.object({
  ativarCrossfit: z.boolean(),
});

type GeralFormData = z.infer<typeof geralSchema>;

const ConfiguracoesAdminPage = () => {
  // Estados para previews de imagens
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [crossfitBanner, setCrossfitBanner] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const crossfitInputRef = useRef<HTMLInputElement>(null);

  // Estados para switches
  const [ativarAulasExtras, setAtivarAulasExtras] = useState(false);
  const [ativarCrossfit, setAtivarCrossfit] = useState(false);

  // Forms
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<GeralFormData>({
    resolver: zodResolver(geralSchema),
    defaultValues: {
      nomeEscolinha: "Gol de Placa Academy",
      mensagemBoasVindas: "Bem-vindo à nossa família! Aqui seu filho vai crescer jogando futebol com alegria e disciplina.",
    },
  });

  const onSubmit = async (data: GeralFormData) => {
    try {
      await new Promise(r => setTimeout(r, 1200));
      console.log("Configurações salvas:", data);
      toast.success("Configurações atualizadas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCrossfitBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCrossfitBanner(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => setLogoPreview(null);
  const removeCrossfitBanner = () => setCrossfitBanner(null);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Configurações da Escolinha</h1>
        <p className="text-gray-600 text-lg mt-2">Personalize sua escolinha e ative funcionalidades extras</p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aulasextras">Aulas Extras</TabsTrigger>
          <TabsTrigger value="crossfit">CrossFit Adultos</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
        </TabsList>

        {/* ABA 1: Geral */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Logo da Escolinha */}
                <div className="flex flex-col items-center gap-4 py-6 border-b">
                  <Avatar className="h-40 w-40 ring-4 ring-blue-100">
                    <AvatarImage src={logoPreview || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-blue-600 to-cyan-600 text-white text-4xl font-bold">
                      GP
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

                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} className="hidden" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomeEscolinha">Nome da Escolinha</Label>
                  <Input id="nomeEscolinha" {...register("nomeEscolinha")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensagemBoasVindas">Mensagem de Boas-vindas (dashboard do aluno)</Label>
                  <Textarea
                    id="mensagemBoasVindas"
                    rows={4}
                    {...register("mensagemBoasVindas")}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Configurações Gerais"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: Aulas Extras */}
        <TabsContent value="aulasextras">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Aulas Extras Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div>
                  <Label className="text-lg font-semibold">Permitir aulas extras</Label>
                  <p className="text-sm text-gray-600 mt-1">Alunos poderão solicitar aulas individuais (finalização, condicionamento, etc)</p>
                </div>
                <Switch checked={ativarAulasExtras} onCheckedChange={setAtivarAulasExtras} />
              </div>

              {ativarAulasExtras && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input placeholder="Nome da aula (ex: Finalização)" />
                    <Input type="number" placeholder="Valor (R$)" />
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Duração" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-linear-to-r from-yellow-600 to-orange-600">
                    Adicionar Aula Extra
                  </Button>

                  {/* Tabela de aulas extras cadastradas (exemplo) */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Aula</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Duração</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Condicionamento Físico</TableCell>
                          <TableCell>R$ 80</TableCell>
                          <TableCell>45 min</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">Editar</Button>
                            <Button size="sm" variant="ghost" className="text-red-600">Excluir</Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: CrossFit para Pais e Comunidade */}
        <TabsContent value="crossfit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-red-600" />
                CrossFit para Pais e Comunidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div>
                  <Label className="text-lg font-semibold">Ativar CrossFit para adultos</Label>
                  <p className="text-sm text-gray-600 mt-1">Ofereça aulas de CrossFit enquanto os filhos treinam futebol</p>
                </div>
                <Switch checked={ativarCrossfit} onCheckedChange={setAtivarCrossfit} />
              </div>

              {ativarCrossfit && (
                <div className="space-y-8">
                  {/* Banner do CrossFit */}
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
                        <Button type="button" variant="destructive" size="sm" onClick={removeCrossfitBanner}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </Button>
                      )}
                    </div>

                    <input type="file" accept="image/*" ref={crossfitInputRef} onChange={handleCrossfitBannerChange} className="hidden" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nome do serviço</Label>
                      <Input placeholder="ex: CrossFit FutElite Pais" />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor mensal</Label>
                      <Input type="number" placeholder="ex: 149" />
                    </div>
                    <div className="space-y-2">
                      <Label>Professor responsável</Label>
                      <Input placeholder="ex: Professor Marcos" />
                    </div>
                    <div className="space-y-2">
                      <Label>Limite de vagas por turma</Label>
                      <Input type="number" placeholder="ex: 15" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Horários disponíveis</Label>
                    <Textarea 
                      placeholder="Segunda e Quarta: 18h-19h\nTerça e Quinta: 19h-20h\nSábado: 9h-10h"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição para os pais</Label>
                    <Textarea 
                      placeholder="Enquanto seu filho treina futebol, você faz CrossFit com os melhores professores! Aulas no mesmo horário do treino infantil."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                    Salvar Configurações CrossFit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: Notificações (exemplo simples) */}
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-indigo-600" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-lg font-semibold">Lembrete de treino 1h antes</Label>
                  <p className="text-sm text-gray-600">Envia notificação automática para responsáveis</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-lg font-semibold">Aviso de mensalidade vencendo</Label>
                  <p className="text-sm text-gray-600">Avisa 5 dias antes do vencimento</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Salvar Configurações de Notificações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesAdminPage;