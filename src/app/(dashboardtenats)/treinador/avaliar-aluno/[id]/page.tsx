// src/app/(dashboard)/treinador/avaliar-aluno/page.tsx
"use client";

import { useState } from "react";
import { Star, MessageSquare, Calendar, TrendingUp, Save, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

interface AvaliacaoCategoria {
  nome: string;
  nota: number; // 1 a 10
  descricao: string;
}

const AvaliarAlunoPage = () => {
  const aluno = {
    nome: "Enzo Gabriel",
    categoria: "Sub-11",
    idade: 10,
    mediaGeral: 8.4,
    avaliacoesAnteriores: 6,
  };

  const [categorias, setCategorias] = useState<AvaliacaoCategoria[]>([
    { nome: "Controle de Bola", nota: 8, descricao: "Domínio e proteção da bola" },
    { nome: "Passe", nota: 9, descricao: "Precisão e visão de jogo" },
    { nome: "Drible", nota: 7, descricao: "1x1 e mudança de direção" },
    { nome: "Finalização", nota: 8, descricao: "Eficiência na conclusão" },
    { nome: "Condicionamento Físico", nota: 9, descricao: "Resistência e explosão" },
    { nome: "Inteligência Tática", nota: 8, descricao: "Posicionamento e leitura de jogo" },
    { nome: "Comportamento", nota: 10, descricao: "Disciplina, respeito e trabalho em equipe" },
  ]);

  const [comentario, setComentario] = useState("");

  const definirNota = (index: number, nota: number) => {
    const novas = [...categorias];
    novas[index].nota = nota;
    setCategorias(novas);
  };

  const mediaAtual = categorias.reduce((acc, cat) => acc + cat.nota, 0) / categorias.length;

  const salvarAvaliacao = () => {
    toast.success("Avaliação salva com sucesso!", {
      description: `${aluno.nome} recebeu média ${mediaAtual.toFixed(1)} nesta avaliação`,
      duration: 6000,
    });
    // Em produção: enviar pro Supabase
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      {/* Cabeçalho do Aluno */}
       <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/treinador/meus-alunos">
                  <ChevronLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
              <h1 className="text-4xl font-bold flex items-center justify-center lg:justify-start gap-4">
              <Star className="h-12 w-12 text-yellow-600" />
                 Avaliar Aluno
              </h1>
              </div>
            </div>
      <div className="text-center lg:text-left">
       
        <div className="mt-6 bg-linear-to-r from-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-200 flex flex-col lg:flex-row items-center gap-8">
          <Avatar className="h-32 w-32 ring-8 ring-white shadow-2xl">
            <AvatarFallback className="text-4xl font-bold bg-linear-to-r from-purple-600 to-pink-600 text-white">
              {aluno.nome.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="text-center lg:text-left">
            <p className="text-3xl font-bold text-purple-900">{aluno.nome}</p>
            <p className="text-xl text-purple-700 mt-1">{aluno.categoria} • {aluno.idade} anos</p>
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
              <Badge className="text-lg px-6 py-2 bg-yellow-100 text-yellow-800">
                <TrendingUp className="mr-2 h-5 w-5" />
                Média Geral: {aluno.mediaGeral.toFixed(1)}
              </Badge>
              <Badge className="text-lg px-6 py-2 bg-blue-100 text-blue-800">
                <Calendar className="mr-2 h-5 w-5" />
                {aluno.avaliacoesAnteriores} avaliações anteriores
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Média Atual em Tempo Real */}
      <Card className="bg-linear-to-r from-yellow-50 to-amber-50 border-yellow-300">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-yellow-800">
            Média da Avaliação Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold text-yellow-600">{mediaAtual.toFixed(1)}</div>
          <div className="flex justify-center mt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <Star
                key={n}
                className={`h-10 w-10 ${n <= Math.round(mediaAtual) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avaliação por Categoria */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Avalie por categoria (1 a 10)</h2>
        {categorias.map((cat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                  {cat.nome}
                </CardTitle>
                <div className="text-3xl font-bold text-yellow-600">{cat.nota}</div>
              </div>
              <p className="text-gray-600 mt-2">{cat.descricao}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((nota) => (
                  <Button
                    key={nota}
                    variant={cat.nota === nota ? "default" : "outline"}
                    size="lg"
                    className={`w-12 h-12 rounded-full ${
                      cat.nota === nota ? "bg-yellow-600 hover:bg-yellow-700" : ""
                    }`}
                    onClick={() => definirNota(index, nota)}
                  >
                    {nota}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comentário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            Comentário do Professor (opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Enzo tem melhorado muito no controle de bola sob pressão. Continua focando na perna não dominante na finalização..."
            rows={6}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-12 py-8 text-xl bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl"
          onClick={salvarAvaliacao}
        >
          <Save className="mr-4 h-8 w-8" />
          Salvar Avaliação (Média {mediaAtual.toFixed(1)})
        </Button>
      </div>
    </div>
  );
};

export default AvaliarAlunoPage;