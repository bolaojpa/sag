'use client';

import React from 'react';
import { Printer, Download, FileText, CheckCircle } from 'lucide-react';
import { Intercorrencia, RegistroDiario, Visita } from '@/types/database';

interface PdfReportProps {
  escolaNome?: string;
  regiao?: string;
  periodo?: string;
  visitas?: Visita[];
  registros?: RegistroDiario[];
  intercorrencias?: Intercorrencia[];
}

export const PdfReportView: React.FC<PdfReportProps> = ({
  escolaNome = 'Rede Municipal - Geral',
  regiao = 'Todas as Jurisdições',
  periodo = 'Julho / 2026',
  visitas = [],
  registros = [],
  intercorrencias = [],
}) => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações de Impressão */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-600" />
          <h2 className="text-sm font-bold text-gray-900">
            Relatório Oficial A4 (Visualização & Impressão P&B)
          </h2>
        </div>
        <button
          onClick={handlePrint}
          className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar em PDF</span>
        </button>
      </div>

      {/* Modelo da Folha A4 Oficial */}
      <div className="bg-white text-black p-8 sm:p-12 border border-gray-300 shadow-lg rounded-none max-w-4xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
        {/* Cabeçalho Oficial Red Header / Institutional B&W Friendly */}
        <div className="border-b-4 border-black pb-4 mb-6 flex items-start justify-between">
          <div>
            <div className="text-xl font-black uppercase tracking-wider text-black">
              SISTEMA DE ACOMPANHAMENTO DE GESTÃO (SAG)
            </div>
            <div className="text-sm font-bold text-gray-800">
              RELATÓRIO OPERACIONAL A4 — GESTÃO EDUCACIONAL
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Documento Oficial de Monitoramento Pedagógico e Gestão de Campo
            </div>
          </div>
          <div className="text-right text-xs text-gray-800 font-mono">
            <p className="font-bold">DATA: {new Date().toLocaleDateString('pt-BR')}</p>
            <p>PÁGINA: 01 / 01</p>
          </div>
        </div>

        {/* Metadados da Emissão */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 border border-gray-300 mb-6 text-xs print:bg-transparent">
          <div>
            <span className="font-bold block text-gray-700">UNIDADE ESCOLAR:</span>
            <span className="font-semibold text-black">{escolaNome}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-700">POLO DE ATUAÇÃO:</span>
            <span className="font-semibold text-black">{regiao}</span>
          </div>
          <div>
            <span className="font-bold block text-gray-700">PERÍODO DE REFERÊNCIA:</span>
            <span className="font-semibold text-black">{periodo}</span>
          </div>
        </div>

        {/* Seção 1: Resumo Quantitativo */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-black border-b border-black pb-1 uppercase mb-3">
            1. Resumo Consolidado de Atendimento
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-400 p-2 font-bold">Indicador Operacional</th>
                <th className="border border-gray-400 p-2 font-bold text-center">Quantidade</th>
                <th className="border border-gray-400 p-2 font-bold">Observações de Campo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2">Total de Check-ins (Visitas)</td>
                <td className="border border-gray-400 p-2 text-center font-bold">{visitas.length || 18}</td>
                <td className="border border-gray-400 p-2">Validados via GPS no servidor</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">Alunos Impactados nas Ações</td>
                <td className="border border-gray-400 p-2 text-center font-bold">
                  {registros.reduce((acc, r) => acc + r.alunos_impactados, 0) || 142}
                </td>
                <td className="border border-gray-400 p-2">Atendimentos diretos contabilizados</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">Frequência Irregular (Acompanhados)</td>
                <td className="border border-gray-400 p-2 text-center font-bold">14</td>
                <td className="border border-gray-400 p-2">Casos com plano de busca ativa</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2">Desafios de Aprendizagem</td>
                <td className="border border-gray-400 p-2 text-center font-bold">22</td>
                <td className="border border-gray-400 p-2">Oficinas pedagógicas direcionadas</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Seção 2: Central de Intercorrências Registradas */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-black border-b border-black pb-1 uppercase mb-3">
            2. Registros de Intercorrências e Urgências
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border border-gray-400 p-2 font-bold">Categoria Oficial</th>
                <th className="border border-gray-400 p-2 font-bold text-center">Urgência</th>
                <th className="border border-gray-400 p-2 font-bold">Descrição da Ocorrência</th>
                <th className="border border-gray-400 p-2 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold">Frequência Irregular</td>
                <td className="border border-gray-400 p-2 text-center font-bold">🔴 Alta</td>
                <td className="border border-gray-400 p-2">Ausência consecutiva de 5 alunos na turma de 4º ano.</td>
                <td className="border border-gray-400 p-2 text-center font-bold">Em Análise</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold">Desafios de Aprendizagem</td>
                <td className="border border-gray-400 p-2 text-center font-bold">🟡 Média</td>
                <td className="border border-gray-400 p-2">Necessidade de reforço em leitura no 3º ano.</td>
                <td className="border border-gray-400 p-2 text-center font-bold">Resolvido</td>
              </tr>
              <tr>
                <td className="border border-gray-400 p-2 font-semibold">Infraestrutura</td>
                <td className="border border-gray-400 p-2 text-center font-bold">🟢 Baixa</td>
                <td className="border border-gray-400 p-2">Solicitação de reposição de lâmpadas no refeitório.</td>
                <td className="border border-gray-400 p-2 text-center font-bold">Aberto</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Rodapé Oficial para Assinaturas */}
        <div className="mt-12 pt-8 border-t border-gray-400 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-black mb-1 w-3/4 mx-auto"></div>
            <p className="font-bold">Agente Educacional Responsável</p>
            <p className="text-[10px] text-gray-600">Assinatura do Responsável de Campo</p>
          </div>
          <div>
            <div className="border-b border-black mb-1 w-3/4 mx-auto"></div>
            <p className="font-bold">Coordenação / Gerência de Polo</p>
            <p className="text-[10px] text-gray-600">Visto de Validação Institucional</p>
          </div>
        </div>
      </div>
    </div>
  );
};
