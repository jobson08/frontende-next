/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/src/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Label } from "@/src/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  Shield,
  UserCheck,
  Calendar,
  Loader2,
  AlertCircle,
  DollarSign,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pagination } from "@/src/components/common/Pagination";

// Função para formatar telefone
const formatarTelefone = (phone: string | null) => {
  if (!phone) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Função para calcular idade
const calcularIdade = (birthDate: string | Date): number => {
  const hoje = new Date();
  const nascimento = new Date(birthDate);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesAtual = hoje.getMonth();
  const mesNasc = nascimento.getMonth();

  if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
};

interface AlunoDetalhe {
  id: string;
  nome: string;
  dataNascimento: string;
  telefone: string | null;
  email: string | null;
  status: "ATIVO" | "INATIVO" | "TRANCADO";
  observacoes: string | null;
  createdAt: string;
  responsavel?: {
    nome: string;
    telefone: string | null;
    email: string | null;
  } | null;
  userId: string | null;
  categoria: string | null;
  valorPlano?: number; // ← adicione isso no backend se possível (valor atual do plano)
}

interface PagamentoAluno {
  id: string;
  mesReferencia: string;
  valor: number;
  dataVencimento: string;
  dataPagamento: string | null;
  metodo: string | null;
  status: "PAGO" | "PENDENTE" | "ATRASADO";
  observacao: string | null;
}

const AlunoDetalhePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [valorPagamento, setValorPagamento] = useState<number>(150);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split("T")[0]);
  const [metodoPagamento, setMetodoPagamento] = useState("DINHEIRO");
  const [observacaoPagamento, setObservacaoPagamento] = useState("");
  const [gerarProximo, setGerarProximo] = useState(true);
  const [mesReferenciaInput, setMesReferenciaInput] = useState(format(new Date(), 'yyyy-MM')); // ex: "2026-02"


// Paginação da tabela de pagamentos
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Busca detalhes do aluno
  const { data: aluno, isLoading, error } = useQuery<AlunoDetalhe>({
    queryKey: ["aluno", id],
    queryFn: async () => {
      const res = await api.get(`/tenant/alunos/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });


  // Mutation para criar pagamento
const criarPagamentoMutation = useMutation({
  mutationFn: async () => {
    // Primeiro dia do mês escolhido no input type="month"
    const [year, month] = mesReferenciaInput.split('-');
    const mesReferenciaPrimeiroDia = `${year}-${month}-01`; // ex: "2026-02-01"

    const payload = {
      mesReferencia: mesReferenciaPrimeiroDia,
      dataVencimento: dataPagamento, // dia exato escolhido no input date
      valor: valorPagamento,
      dataPagamento: dataPagamento ? dataPagamento : null,
      metodo: metodoPagamento,
      observacao: observacaoPagamento.trim() || undefined,
      gerarProximo,
    };

    console.log("Payload enviado:", payload);

    await api.post(`/tenant/alunos/${id}/pagamentos`, payload);
  },
  onSuccess: () => {
    toast.success("Pagamento registrado com sucesso!");
    queryClient.invalidateQueries({ queryKey: ["aluno", id] });
    queryClient.invalidateQueries({ queryKey: ["pagamentos-aluno", id] });
    setPagamentoModalOpen(false);

    setValorPagamento(150);
    setDataPagamento(new Date().toISOString().split("T")[0]);
    setMetodoPagamento("DINHEIRO");
    setObservacaoPagamento("");
    setGerarProximo(true);
    setMesReferenciaInput(format(new Date(), 'yyyy-MM')); // reset
  },
  onError: (err: any) => {
    console.error("Erro completo:", err.response?.data);
    toast.error("Erro ao registrar pagamento", {
      description: err.response?.data?.error || err.message || "Verifique os dados",
    });
  },
});

// Busca histórico de pagamentos do aluno ← ESSA É A LINHA QUE DEFINE "pagamentos"
const { 
  data: pagamentos = [], 
  isLoading: isLoadingPagamentos 
} = useQuery<PagamentoAluno[]>({
  queryKey: ["pagamentos-aluno", id],
  queryFn: async () => {
    const res = await api.get(`/tenant/alunos/${id}/pagamentos`);
    return res.data.data || [];
  },
  enabled: !!id,
});

  // Agora sim: lógica de paginação DEPOIS da query
  const totalPagamentos = pagamentos.length;
  const totalPages = Math.ceil(totalPagamentos / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPagamentos = pagamentos.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

if (isLoading || isLoadingPagamentos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600">Carregando detalhes do aluno...</p>
      </div>
    );
  }

  if (error || !aluno) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600">
        <AlertCircle className="h-16 w-16" />
        <h2 className="mt-4 text-2xl font-bold">Aluno não encontrado</h2>
        <p className="mt-2 text-gray-600">{(error as Error)?.message || "ID inválido ou aluno removido"}</p>
        <Button className="mt-6" asChild>
          <Link href="/aluno">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const idade = calcularIdade(aluno.dataNascimento);
  const isMaior = idade >= 18;
  const temResponsavel = !!aluno.responsavel;
  const podeGerarPagamento = aluno.status === "ATIVO";

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/aluno">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detalhes do Aluno</h1>
          <p className="text-gray-600">Informações completas de {aluno.nome}</p>
        </div>
      </div>

      {/* Perfil Principal */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
            <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-bold">
                {aluno.nome.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold">{aluno.nome}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 justify-center sm:justify-start">
                <Badge
                  className={`text-xs text-white ${
                    aluno.status === "ATIVO"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : aluno.status === "INATIVO"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {aluno.status}
                </Badge>
                {isMaior && <Badge variant="outline">Maior de idade</Badge>}
                {aluno.userId && <Badge className="bg-green-600">Tem acesso ao app</Badge>}
                <Badge variant="outline">{aluno.categoria || "Sem categoria"}</Badge>
              </div>
            </div>
            <div className="ml-auto flex gap-3">
              <Button size="lg" asChild>
                <Link href={`/aluno/${aluno.id}/editar`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Editar Aluno
                </Link>
              </Button>

              {/* Botão Gerar Pagamento - só aparece se ATIVO */}
              {podeGerarPagamento && (
                <Button size="lg" asChild className="bg-gradient-to-r lg from-green-600 to-emerald-600">
                  <Link href={`/aluno/${aluno.id}/pagamentos`}>
                  <DollarSign className="mr-2 h-2 w-2" />
                      Gerar Mensalidade
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-2 w-2" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Nascimento</span>
              <span className="font-medium">
                {aluno.dataNascimento
                  ? aluno.dataNascimento.split("T")[0].split("-").reverse().join("/")
                  : "Não informado"}{" "}
                ({calcularIdade(aluno.dataNascimento)} anos)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone</span>
              <span className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {formatarTelefone(aluno.telefone)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">E-mail</span>
              <span className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {aluno.email || "Não informado"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de Matrícula</span>
              <span className="font-medium">
                {new Date(aluno.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Responsável
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {temResponsavel ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome</span>
                  <span className="font-medium">{aluno.responsavel?.nome || "Sem responsável cadastrado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Telefone</span>
                  <span className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {formatarTelefone(aluno.responsavel?.telefone || "Não informado")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-mail</span>
                  <span className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {aluno.responsavel?.email || "Não informado"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aluno maior de idade (sem responsável cadastrado)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {aluno.observacoes || "Nenhuma observação cadastrada."}
          </p>
        </CardContent>
      </Card>

{/* Histórico de Pagamentos - agora usa a variável correta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Histórico de Pagamentos ({totalPagamentos})
            </div>
            <Badge variant="secondary" className="text-sm">
              Total pago: R$ {pagamentos
                .filter(p => p.status === "PAGO")
                .reduce((sum, p) => sum + p.valor, 0)
                .toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalPagamentos === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum pagamento registrado para este aluno ainda.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês/Referência</TableHead>
                    <TableHead className="hidden md:table-cell">Valor</TableHead>
                    <TableHead className="hidden md:table-cell">Vencimento</TableHead>
                    <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                    <TableHead className="hidden md:table-cell">Método</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPagamentos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {format(new Date(p.mesReferencia), "MMMM 'de' yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.dataVencimento && isValid(new Date(p.dataVencimento))
                          ? format(new Date(p.dataVencimento), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.dataPagamento && isValid(new Date(p.dataPagamento))
                          ? format(new Date(p.dataPagamento), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {p.metodo || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === "PAGO" ? "default" : p.status === "PENDENTE" ? "secondary" : "destructive"}
                          className={
                            p.status === "PAGO" ? "bg-green-600 text-white" :
                            p.status === "PENDENTE" ? "bg-orange-600 text-white" :
                            "bg-red-600 text-white"
                          }
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/pagamento/${p.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Ver detalhes
                              </Link>
                            </DropdownMenuItem>
                            {p.status !== "PAGO" && (
                              <DropdownMenuItem className="text-green-600 focus:text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como pago
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <Pagination
                currentPage={currentPage}
                totalItems={totalPagamentos}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="mt-6"
              />
            </>
          )}
        </CardContent>
      </Card>

{/* Modal de Gerar Pagamento */}
        <AlertDialog open={pagamentoModalOpen} onOpenChange={setPagamentoModalOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Gerar Pagamento Manual
              </AlertDialogTitle>
              <AlertDialogDescription>
                Registre o pagamento de <strong>{aluno.nome}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="valor">Valor do Pagamento</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={valorPagamento}
                  onChange={(e) => setValorPagamento(Number(e.target.value))}
                  className="text-lg font-medium"
                />
              </div>

              {/* Novo campo: Mês de Referência */}
              <div className="grid gap-2">
                <Label htmlFor="mesReferencia">Mês de Referência</Label>
                <Input
                  id="mesReferencia"
                  type="month"
                  value={mesReferenciaInput}
                  onChange={(e) => setMesReferenciaInput(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Será usado como referência do mês (salvo como dia 01)
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metodo">Método de Pagamento</Label>
                <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                  <SelectTrigger id="metodo">
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="CARTAO">Cartão</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observacao">Observação (opcional)</Label>
                <Input
                  id="observacao"
                  value={observacaoPagamento}
                  onChange={(e) => setObservacaoPagamento(e.target.value)}
                  placeholder="Ex: Pagamento em dinheiro na secretaria"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gerar-proximo"
                  checked={gerarProximo}
                  onCheckedChange={(checked) => setGerarProximo(!!checked)}
                />
                <Label htmlFor="gerar-proximo" className="cursor-pointer">
                  Gerar próxima mensalidade automaticamente (pendente)
                </Label>
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                onClick={() => criarPagamentoMutation.mutate()}
                disabled={criarPagamentoMutation.isPending}
              >
                {criarPagamentoMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Confirmar Pagamento"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};

export default AlunoDetalhePage;