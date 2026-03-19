/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/crossfit-gestao/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Users, Edit, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import api from "@/src/lib/api";
import Link from "next/link";

const CrossfitGestaoPage = () => {
  const [turmas, setTurmas] = useState<any[]>([]);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false);
  const [isEditTurmaModalOpen, setIsEditTurmaModalOpen] = useState(false);
  const [isInscricaoModalOpen, setIsInscricaoModalOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<any>(null);
  const [editingTurma, setEditingTurma] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states para nova/editar turma
  const [nomeTurma, setNomeTurma] = useState("");
  const [horarioTurma, setHorarioTurma] = useState("");
  const [valorTurma, setValorTurma] = useState(0);
  const [vagasMaxTurma, setVagasMaxTurma] = useState(15);
  const [descricaoTurma, setDescricaoTurma] = useState("");
  const [professorTurmaId, setProfessorTurmaId] = useState("");

  // Form states para nova inscrição
  const [selectedAlunoId, setSelectedAlunoId] = useState("");
  const [observacaoInscricao, setObservacaoInscricao] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [resTurmas, resAlunos, resProfessores] = await Promise.all([
          api.get("/tenant/crossfit/turmas"),
          api.get("/tenant/alunos-crossfit"),
          api.get("/tenant/funcionarios"),
        ]);

        setTurmas(resTurmas.data.data || []);
        setAlunos(resAlunos.data.data || []);
        setProfessores(resProfessores.data.data || []);
      } catch (err) {
        toast.error("Erro ao carregar dados");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Carregar inscrições da turma selecionada
  const loadInscricoes = async (turmaId: string) => {
    try {
      const res = await api.get(`/tenant/crossfit/inscricoes/${turmaId}`);
      setInscricoes(res.data.data || []);
    } catch (err) {
      toast.error("Erro ao carregar inscritos");
    }
  };

  // Abrir modal de nova turma
  const openNovaTurmaModal = () => {
    setNomeTurma("");
    setHorarioTurma("");
    setValorTurma(0);
    setVagasMaxTurma(15);
    setDescricaoTurma("");
    setProfessorTurmaId("");
    setIsTurmaModalOpen(true);
    setEditingTurma(null); // limpa edição
  };

  // Abrir modal de edição de turma
  const openEditarTurmaModal = (turma: any) => {
    setEditingTurma(turma);
    setNomeTurma(turma.nome);
    setHorarioTurma(turma.horario || "");
    setValorTurma(turma.valorMensalidade);
    setVagasMaxTurma(turma.vagasMax);
    setDescricaoTurma(turma.descricao || "");
    setProfessorTurmaId(turma.professorId);
    setIsEditTurmaModalOpen(true);
  };

  // Salvar nova ou editar turma
  const salvarTurma = async () => {
    if (!nomeTurma.trim() || valorTurma <= 0 || !professorTurmaId) {
      toast.error("Preencha nome, valor e professor");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nome: nomeTurma.trim(),
        horario: horarioTurma.trim() || undefined,
        valorMensalidade: valorTurma,
        vagasMax: vagasMaxTurma,
        descricao: descricaoTurma.trim() || undefined,
        professorId: professorTurmaId,
      };

      if (editingTurma) {
        // Atualiza turma existente
        await api.put(`/tenant/crossfit/turmas/${editingTurma.id}`, payload);
        toast.success("Turma atualizada com sucesso!");
      } else {
        // Cria nova turma
        await api.post("/tenant/crossfit/turmas", payload);
        toast.success("Turma criada com sucesso!");
      }

      // Recarrega lista
      const res = await api.get("/tenant/crossfit/turmas");
      setTurmas(res.data.data || []);

      setIsTurmaModalOpen(false);
      setIsEditTurmaModalOpen(false);
      setEditingTurma(null);
    } catch (err: any) {
      toast.error("Erro ao salvar turma", {
        description: err.response?.data?.error || "Tente novamente",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const excluirTurmaConfirm = async (turmaId: string) => {
  if (!confirm("Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.")) return;

  try {
    await api.delete(`/tenant/crossfit/turmas/${turmaId}`);
    toast.success("Turma excluída com sucesso!");

    // Recarrega lista
    const res = await api.get("/tenant/crossfit/turmas");
    setTurmas(res.data.data || []);
  } catch (err: any) {
    console.error("ERRO AO EXCLUIR TURMA:", err.response?.data);
    const msg = err.response?.data?.error || "Erro ao excluir turma";
    toast.error("Erro ao excluir turma", { description: msg });
  }
};

  // Abrir modal de inscrições da turma
  const openInscricoesModal = (turma: any) => {
    setSelectedTurma(turma);
    setSelectedAlunoId("");
    setObservacaoInscricao("");
    setIsInscricaoModalOpen(true);
    loadInscricoes(turma.id);
  };

  // Salvar nova inscrição
  const salvarInscricao = async () => {
    if (!selectedTurma?.id || !selectedAlunoId) {
      toast.error("Selecione a turma e um aluno");
      return;
    }

    const jaInscrito = inscricoes.some(ins => ins.alunoId === selectedAlunoId);
    if (jaInscrito) {
      toast.warning("Este aluno já está inscrito nesta turma");
      return;
    }

    const payload = {
      aulaCrossfitId: selectedTurma.id,
      alunoId: selectedAlunoId,
      observacao: observacaoInscricao.trim() || undefined,
    };

    console.log("PAYLOAD ENVIADO PARA INSCRIÇÃO:", JSON.stringify(payload, null, 2));

    setIsSaving(true);
    try {
      await api.post("/tenant/crossfit/inscricoes", payload);
      toast.success("Aluno inscrito com sucesso!");
      loadInscricoes(selectedTurma.id);
    } catch (err: any) {
      console.error("ERRO AO INSCREVER:", err.response?.data);
      const msg = err.response?.data?.error || "Erro ao inscrever aluno";
      toast.error("Erro ao inscrever aluno", { description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Excluir inscrição
  const excluirInscricao = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta inscrição?")) return;

    try {
      await api.delete(`/tenant/crossfit/inscricoes/${id}`);
      toast.success("Inscrição excluída");
      if (selectedTurma) loadInscricoes(selectedTurma.id);
    } catch (err) {
      toast.error("Erro ao excluir inscrição");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Gestão de CrossFit</h1>
          <p className="text-gray-600 mt-2">Crie turmas e gerencie inscrições de alunos</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={openNovaTurmaModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>

          <Button asChild className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700">
            <Link href="/crossfit/aluno">
              <UserPlus className="mr-2 h-4 w-4" />
              Alunos
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {turmas.map((turma) => (
          <Card key={turma.id} className="overflow-hidden">
            <CardHeader className="bg-red-50">
              <CardTitle className="flex items-center justify-between">
                {turma.nome}
                <div className="flex gap-2">
                  <Button onClick={() => openInscricoesModal(turma)} className="bg-blue-600 hover:bg-blue-700">
                    <Users className="mr-2 h-4 w-4" />
                    Gerenciar Inscrições ({turma._count?.inscricoes || 0}/{turma.vagasMax})
                  </Button>
                  
                   <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditarTurmaModal(turma)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => excluirTurmaConfirm(turma.id)}
                    disabled={turma._count?.inscricoes > 0}
                    title={turma._count?.inscricoes > 0 ? "Remova os alunos inscritos antes" : ""}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Valor mensal: R$ {turma.valorMensalidade.toFixed(2)} | Horário: {turma.horario || "-"} | Professor: {turma.professor?.nome || "Não definido"}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}

        {turmas.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Nenhuma turma de CrossFit cadastrada ainda.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal para criar/editar turma */}
      <Dialog open={isTurmaModalOpen || isEditTurmaModalOpen} onOpenChange={(open) => {
        setIsTurmaModalOpen(open);
        setIsEditTurmaModalOpen(open);
        if (!open) setEditingTurma(null);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTurma ? "Editar Turma" : "Criar Nova Turma"} de CrossFit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nomeTurma" className="text-right">Nome</Label>
              <Input id="nomeTurma" className="col-span-3" value={nomeTurma} onChange={e => setNomeTurma(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="horario" className="text-right">Horário</Label>
              <Input id="horario" className="col-span-3" value={horarioTurma} onChange={e => setHorarioTurma(e.target.value)} placeholder="ex: Segunda e Quarta - 19h" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">Valor mensal</Label>
              <Input id="valor" type="number" step="0.01" className="col-span-3" value={valorTurma} onChange={e => setValorTurma(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vagas" className="text-right">Vagas</Label>
              <Input id="vagas" type="number" className="col-span-3" value={vagasMaxTurma} onChange={e => setVagasMaxTurma(Number(e.target.value))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professor" className="text-right">Professor</Label>
              <Select value={professorTurmaId} onValueChange={setProfessorTurmaId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map(prof => (
                    <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">Descrição</Label>
              <Textarea id="descricao" className="col-span-3" value={descricaoTurma} onChange={e => setDescricaoTurma(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => {
              setIsTurmaModalOpen(false);
              setIsEditTurmaModalOpen(false);
              setEditingTurma(null);
            }}>Cancelar</Button>
            <Button onClick={salvarTurma} disabled={isSaving}>
              {isSaving ? "Salvando..." : (editingTurma ? "Salvar Alterações" : "Criar Turma")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para gerenciar inscrições */}
      <Dialog open={isInscricaoModalOpen} onOpenChange={setIsInscricaoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Inscrições - {selectedTurma?.nome}</DialogTitle>
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

            <div className="md:col-span-2">
              <Label>Observação</Label>
              <Textarea value={observacaoInscricao} onChange={e => setObservacaoInscricao(e.target.value)} placeholder="Observações do professor..." />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={salvarInscricao} disabled={isSaving} className="bg-green-600">
                {isSaving ? "Salvando..." : "Adicionar Aluno"}
              </Button>
            </div>
          </div>

          {/* Tabela de inscritos */}
          <Card>
            <CardHeader>
              <CardTitle>Alunos Inscritos ({inscricoes.length}/{selectedTurma?.vagasMax})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscricoes.map(ins => (
                    <TableRow key={ins.id}>
                      <TableCell>{ins.aluno?.nome}</TableCell>
                      <TableCell>{ins.dataInscricao ? new Date(ins.dataInscricao).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{ins.status}</TableCell>
                      <TableCell className="max-w-xs truncate">{ins.observacao || "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="destructive" onClick={() => excluirInscricao(ins.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {inscricoes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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

export default CrossfitGestaoPage;