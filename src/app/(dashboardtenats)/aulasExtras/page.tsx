/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/aulas-extras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import api from "@/src/lib/api";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";

const AulasExtrasPage = () => {
const [aulas, setAulas] = useState<any[]>([]);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [treinador, setTreinador] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [isInscricaoModalOpen, setIsInscricaoModalOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<any>(null);
  const [editingAula, setEditingAula] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados do modal de aula (criar/editar)
  const [nomeAula, setNomeAula] = useState("");
  const [valorAula, setValorAula] = useState(0);
  const [duracaoAula, setDuracaoAula] = useState("");
  const [descricaoAula, setDescricaoAula] = useState("");

  // Estados do modal de inscrição
  const [selectedAlunoId, setSelectedAlunoId] = useState("");
  const [selectTreinadoId, setSelectedProfessorId] = useState("");
  const [dataAula, setDataAula] = useState("");
  const [status, setStatus] = useState("inscrito");
  const [observacao, setObservacao] = useState("");
  const [pagamentoId, setPagamentoId] = useState("");

  const { refreshConfig } = useEscolinhaConfig();

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [resAulas, resAlunos, resTreinador] = await Promise.all([
          api.get("/tenant/config/aulas-extras"),
          api.get("/tenant/alunos"),
          api.get("/tenant/treinadores"),
        ]);

        setAulas(resAulas.data.data || []);
        setAlunos(resAlunos.data.data || []);
        setTreinador(resTreinador.data.data || []);
      } catch (err) {
        toast.error("Erro ao carregar dados");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Carregar inscrições da aula selecionada
  const loadInscricoes = async (aulaId: string) => {
    try {
      const res = await api.get(`/tenant/aula-extra-aluno/aula/${aulaId}`);
      setInscricoes(res.data.data || []);
    } catch (err) {
      toast.error("Erro ao carregar inscrições");
    }
  };

  // Abrir modal de nova aula
  const openNovaAulaModal = () => {
    setEditingAula(null);
    setNomeAula("");
    setValorAula(0);
    setDuracaoAula("");
    setDescricaoAula("");
    setIsAulaModalOpen(true);
  };

  // Abrir modal de edição de aula
  const openEditarAulaModal = (aula: any) => {
    setEditingAula(aula);
    setNomeAula(aula.nome);
    setValorAula(aula.valor);
    setDuracaoAula(aula.duracao);
    setDescricaoAula(aula.descricao || "");
    setIsAulaModalOpen(true);
  };

  // Salvar nova ou editar aula
  const salvarAula = async () => {
    if (!nomeAula.trim() || valorAula <= 0 || !duracaoAula.trim()) {
      toast.error("Preencha nome, valor e duração");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nome: nomeAula.trim(),
        valor: valorAula,
        duracao: duracaoAula.trim(),
        descricao: descricaoAula.trim() || undefined,
      };

      if (editingAula) {
        await api.put(`/tenant/config/aulas-extras/${editingAula.id}`, payload);
        toast.success("Aula atualizada com sucesso!");
      } else {
        await api.post("/tenant/config/aulas-extras", payload);
        toast.success("Aula criada com sucesso!");
      }

      // Recarrega lista
      const res = await api.get("/tenant/config/aulas-extras");
      setAulas(res.data.data || []);

      setIsAulaModalOpen(false);
      setEditingAula(null);
    } catch (err: any) {
      toast.error("Erro ao salvar aula", {
        description: err.response?.data?.error || "Tente novamente",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir modal de inscrições
  const openInscricaoModal = (aula: any) => {
    setSelectedAula(aula);
    setSelectedAlunoId("");
    setSelectedProfessorId("");
    setDataAula("");
    setStatus("inscrito");
    setObservacao("");
    setPagamentoId("");
    setIsInscricaoModalOpen(true);
    loadInscricoes(aula.id);
  };

  // Salvar nova inscrição
  const salvarInscricao = async () => {
    if (!selectedAula?.id || !selectedAlunoId || !selectTreinadoId) {
      toast.error("Selecione aula, aluno e treinador");
      return;
    }

    const jaInscrito = inscricoes.some((ins) => ins.alunoId === selectedAlunoId);
    if (jaInscrito) {
      toast.warning("Este aluno já está inscrito nesta aula");
      return;
    }

    let formattedDataAula = undefined;
    if (dataAula) {
      formattedDataAula = new Date(dataAula).toISOString();
    }

    const payload = {
      aulaExtraId: selectedAula.id,
      alunoId: selectedAlunoId,
      treinadorId: selectTreinadoId,
      dataAula: formattedDataAula,
      status: status || "inscrito",
      observacao: observacao.trim() || undefined,
      pagamentoId: pagamentoId.trim() || undefined,
    };

    setIsSaving(true);
    try {
      await api.post("/tenant/aula-extra-aluno", payload);
      toast.success("Inscrição criada com sucesso!");
      loadInscricoes(selectedAula.id);
      await refreshConfig();
    } catch (err: any) {
      console.error("ERRO:", err.response?.data);
      toast.error("Erro ao inscrever aluno", {
        description: err.response?.data?.error || "Tente novamente",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir inscrição
  const excluirInscricao = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta inscrição?")) return;

    try {
      await api.delete(`/tenant/aula-extra-aluno/${id}`);
      toast.success("Inscrição excluída");
      if (selectedAula) loadInscricoes(selectedAula.id);
      await refreshConfig();
    } catch (err) {
      toast.error("Erro ao excluir inscrição");
    }
  };

  // Excluir aula extra
  const excluirAula = async (aulaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta aula extra? Esta ação não pode ser desfeita.")) return;

    try {
      // Verifica se tem inscrições
      const resInsc = await api.get(`/tenant/aula-extra-aluno/aula/${aulaId}`);
      if (resInsc.data.data?.length > 0) {
        toast.error("Não é possível excluir aula com alunos inscritos. Remova as inscrições primeiro.");
        return;
      }

      await api.delete(`/tenant/config/aulas-extras/${aulaId}`);
      toast.success("Aula excluída com sucesso!");

      // Recarrega lista
      const res = await api.get("/tenant/config/aulas-extras");
      setAulas(res.data.data || []);
    } catch (err: any) {
      toast.error("Erro ao excluir aula", {
        description: err.response?.data?.error || "Tente novamente",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-600" />
      </div>
    );
  }
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Gestão de Aulas Extras</h1>
          <p className="text-gray-600 mt-2">Crie, edite e gerencie aulas extras e inscrições</p>
        </div>
        <Button onClick={openNovaAulaModal} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Aula Extra
        </Button>
      </div>

      <div className="grid gap-6">
        {aulas.map((aula) => (
          <Card key={aula.id} className="overflow-hidden">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center justify-between">
                {aula.nome}
                <div className="flex gap-2">
                 
                  <Button onClick={() => openInscricaoModal(aula)} className="bg-yellow-600 hover:bg-yellow-700">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Inscrições
                  </Button>
                   <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditarAulaModal(aula)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => excluirAula(aula.id)}
                    disabled={aula._count?.inscricoes > 0}  // ← bloqueia se houver inscrições
                    title={aula._count?.inscricoes > 0 
                      ? "Remova todos os alunos inscritos antes de excluir" 
                      : "Excluir aula"}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>

                </div>
              </CardTitle>
              <CardDescription>
                Valor: R$ {aula.valor.toFixed(2)} | Duração: {aula.duracao} | {aula.descricao || "Sem descrição"}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}

        {aulas.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Nenhuma aula extra cadastrada ainda.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para criar/editar aula */}
      <Dialog open={isAulaModalOpen} onOpenChange={(open) => {
        setIsAulaModalOpen(open);
        if (!open) setEditingAula(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAula ? "Editar Aula Extra" : "Adicionar Nova Aula Extra"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeAula" className="text-right">Nome</Label>
              <Input id="nomeAula" className="col-span-3" value={nomeAula} onChange={e => setNomeAula(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valorAula" className="text-right">Valor (R$)</Label>
              <Input id="valorAula" type="number" step="0.01" className="col-span-3" value={valorAula} onChange={e => setValorAula(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duracaoAula" className="text-right">Duração</Label>
              <Select value={duracaoAula} onValueChange={setDuracaoAula}>
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
              <Label htmlFor="descricaoAula" className="text-right">Descrição</Label>
              <Textarea id="descricaoAula" className="col-span-3" value={descricaoAula} onChange={e => setDescricaoAula(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsAulaModalOpen(false);
              setEditingAula(null);
            }}>Cancelar</Button>
            <Button onClick={salvarAula} disabled={isSaving}>
              {isSaving ? "Salvando..." : (editingAula ? "Salvar Alterações" : "Adicionar Aula Extra")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para gerenciar inscrições */}
      <Dialog open={isInscricaoModalOpen} onOpenChange={setIsInscricaoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Inscrições - {selectedAula?.nome}</DialogTitle>
          </DialogHeader>

          {/* Form nova inscrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <Label>Aluno</Label>
              <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map(aluno => (
                    <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Professor / Treinador</Label>
              <Select value={selectTreinadoId} onValueChange={setSelectedProfessorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um treinador" />
                </SelectTrigger>
                <SelectContent>
                  {treinador.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          {/*  <div>
              <Label>Data da Aula</Label>
              <Input type="datetime-local" value={dataAula} onChange={(e) => setDataAula(e.target.value)} />
            </div>*/}

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inscrito">Inscrito</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="faltou">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Observação</Label>
              <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Observações do treinador..." />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={salvarInscricao} disabled={isSaving} className="bg-green-600">
                {isSaving ? "Salvando..." : "Adicionar Inscrição"}
              </Button>
            </div>
          </div>

          {/* Tabela de alunos inscritos */}
          <Card>
            <CardHeader>
              <CardTitle>Alunos Inscritos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Treinador</TableHead>
                    {/*<TableHead>Data</TableHead>*/}
                    <TableHead>Status</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscricoes.map((inscricao) => (
                    <TableRow key={inscricao.id}>
                      <TableCell>{inscricao.aluno?.nome}</TableCell>
                      <TableCell>{inscricao.treinador?.nome}</TableCell>
                    {/*  <TableCell>{inscricao.dataAula ? new Date(inscricao.dataAula).toLocaleString() : "-"}</TableCell>*/}
                      <TableCell>{inscricao.status}</TableCell>
                      <TableCell className="max-w-xs truncate">{inscricao.observacao || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" onClick={() => excluirInscricao(inscricao.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {inscricoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhum aluno inscrito ainda
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AulasExtrasPage;