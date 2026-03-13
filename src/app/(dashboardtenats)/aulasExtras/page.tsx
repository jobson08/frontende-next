/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/aulas-extras/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Edit, Trash2, Users, UserCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Input } from "@/src/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import api from "@/src/lib/api";
import { useEscolinhaConfig } from "@/src/context/EscolinhaConfigContext";

const AulasExtrasPage = () => {
const [aulas, setAulas] = useState<any[]>([]);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estados do modal
  const [selectedAlunoId, setSelectedAlunoId] = useState("");
  const [selectedProfessorId, setSelectedProfessorId] = useState("");
  const [dataAula, setDataAula] = useState("");
  const [status, setStatus] = useState("inscrito");
  const [observacao, setObservacao] = useState("");
  const [pagamentoId, setPagamentoId] = useState("");

  const { refreshConfig } = useEscolinhaConfig();

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const [resAulas, resAlunos, resProfessores] = await Promise.all([
          api.get("/tenant/config/aulas-extras"),
          api.get("/tenant/alunos"),                    // ajuste se sua rota de alunos for diferente
          api.get("/tenant/funcionarios"),              // ajuste se sua rota de professores for diferente
        ]);

        setAulas(resAulas.data.data || []);
        setAlunos(resAlunos.data.data || []);
        setProfessores(resProfessores.data.data || []);
      } catch (err) {
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Carrega inscrições da aula selecionada
  const loadInscricoes = async (aulaId: string) => {
    try {
      const res = await api.get(`/tenant/aula-extra-aluno/aula/${aulaId}`);
      setInscricoes(res.data.data || []);
    } catch (err) {
      toast.error("Erro ao carregar inscrições");
    }
  };

  // Abre modal de inscrição
  const openInscricaoModal = (aula: any) => {
    setSelectedAula(aula);
    setSelectedAlunoId("");
    setSelectedProfessorId("");
    setDataAula("");
    setStatus("inscrito");
    setObservacao("");
    setPagamentoId("");
    setIsModalOpen(true);
    loadInscricoes(aula.id);
  };

  // Salva nova inscrição (POST)
  const salvarInscricao = async () => {
  if (!selectedAula?.id || !selectedAlunoId || !selectedProfessorId) {
    toast.error("Selecione aula, aluno e professor");
    return;
  }

  let formattedDataAula = undefined;
  if (dataAula) {
    // Converte para ISO completo (adiciona segundos e Z se necessário)
    formattedDataAula = new Date(dataAula).toISOString();
  }

  const payload = {
    aulaExtraId: selectedAula.id,
    alunoId: selectedAlunoId,
    funcionarioTreinadorId: selectedProfessorId,
    dataAula: formattedDataAula,
    status: status || "inscrito",
    observacao: observacao.trim() || undefined,
    pagamentoId: pagamentoId.trim() || undefined,
  };

  console.log("PAYLOAD FINAL ENVIADO:", JSON.stringify(payload, null, 2));

  setIsSaving(true);
  try {
    await api.post("/tenant/aula-extra-aluno", payload);
    toast.success("Inscrição criada com sucesso!");
    loadInscricoes(selectedAula.id);
    await refreshConfig();
  } catch (err: any) {
    console.error("ERRO COMPLETO:", err.response?.data);
    toast.error("Erro ao inscrever aluno", {
      description: err.response?.data?.details?.map((d: any) => d.message).join(", ") || err.message || "Verifique o console",
    });
  } finally {
    setIsSaving(false);
  }
};

  // Exclui inscrição
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Gestão de Aulas Extras</h1>
        <p className="text-gray-600 mt-2">Gerencie alunos, professores e inscrições por aula</p>
      </div>

      <div className="grid gap-6">
        {aulas.map((aula) => (
          <Card key={aula.id} className="overflow-hidden">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center justify-between">
                {aula.nome}
                <Button onClick={() => openInscricaoModal(aula)} className="bg-yellow-600 hover:bg-yellow-700">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Inscrições
                </Button>
              </CardTitle>
              <CardDescription>
                Valor: R$ {aula.valor} | Duração: {aula.duracao} | {aula.descricao}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Aqui você pode mostrar um resumo rápido de inscritos, se quiser */}
              <p className="text-sm text-gray-500">Clique em Gerenciar Inscrições para adicionar alunos e professores.</p>
            </CardContent>
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

      {/* Modal de gerenciamento de inscrições */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Inscrições - {selectedAula?.nome}</DialogTitle>
          </DialogHeader>

          {/* Formulário de nova inscrição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <Label>Aluno</Label>
              <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Professor / Treinador</Label>
              <Select value={selectedProfessorId} onValueChange={setSelectedProfessorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data da Aula</Label>
              <Input type="datetime-local" value={dataAula} onChange={(e) => setDataAula(e.target.value)} />
            </div>

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
              <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Observações do professor..." />
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
                    <TableHead>Professor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inscricoes.map((inscricao) => (
                    <TableRow key={inscricao.id}>
                      <TableCell>{inscricao.aluno?.nome}</TableCell>
                      <TableCell>{inscricao.funcionarioTreinador?.nome}</TableCell>
                      <TableCell>{inscricao.dataAula ? new Date(inscricao.dataAula).toLocaleString() : "-"}</TableCell>
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
}

export default AulasExtrasPage;