import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { AlimentoBusca, calcularKcal, porcao } from '../data/alimentos';
import { useApp } from './AppContext'; 

// Alimento registrado numa refeição, com kcal e macros
export type ItemRefeicao = {
  id: string | number;
  nome: string;
  gramas: number;
  kcal: number;
  carboidratos: number;
  proteinas: number;
  gorduras: number;
};

// O que o contexto oferece às telas
type RefeicoesState = {
  refeicoes: Record<string, ItemRefeicao[]>;
  adicionarAlimento: (refeicao: string, alimento: AlimentoBusca, gramas: number) => Promise<void>;
  removerAlimento: (refeicao: string, id: string | number) => void;
  totalConsumido: number;
  totaisMacros: { carboidratos: number; proteinas: number; gorduras: number };
};

// Contexto do diário de refeições
const RefeicoesContext = createContext<RefeicoesState | null>(null);

// Provedor do diário: carrega, adiciona e remove alimentos pelo servidor
export function RefeicoesProvider({ children }: { children: React.ReactNode }) {
  const { usuarioId } = useApp(); 

  const [refeicoes, setRefeicoes] = useState<Record<string, ItemRefeicao[]>>({
    'Café da manhã': [], 'Lanche da manhã': [], 'Almoço': [], 'Lanche da tarde': [], 'Jantar': [], 'Ceia': [],
  });

  // Totais do dia calculados a partir dos itens
  const itens = Object.values(refeicoes).flat();
  const totalConsumido = itens.reduce((soma, item) => soma + item.kcal, 0);
  const totaisMacros = {
    carboidratos: itens.reduce((soma, item) => soma + item.carboidratos, 0),
    proteinas: itens.reduce((soma, item) => soma + item.proteinas, 0),
    gorduras: itens.reduce((soma, item) => soma + item.gorduras, 0),
  };

  // Busca o diário no servidor e agrupa por refeição
  const carregarRefeicoes = useCallback(async () => {
    if (!usuarioId) return; 

    try {
      const dadosBanco = await apiFetch(`/refeicoes/usuario/${usuarioId}`); 
      
      const refeicoesAgrupadas: Record<string, ItemRefeicao[]> = {
        'Café da manhã': [], 'Lanche da manhã': [], 'Almoço': [], 'Lanche da tarde': [], 'Jantar': [], 'Ceia': [],
      };

      dadosBanco.forEach((item: any) => {
        if (refeicoesAgrupadas[item.tipo_refeicao]) {
          refeicoesAgrupadas[item.tipo_refeicao].push({
            id: item.id,
            nome: item.nome_alimento,
            gramas: item.quantidade_gramas,
            kcal: item.calorias,
            carboidratos: item.carboidratos ?? 0,
            proteinas: item.proteinas ?? 0,
            gorduras: item.gorduras ?? 0,
          });
        }
      });

      setRefeicoes(refeicoesAgrupadas);
    } catch (error) {
      console.error("Erro ao carregar refeições do banco:", error);
    }
  }, [usuarioId]); 

  // Recarrega o diário quando o usuário muda
  useEffect(() => {
    carregarRefeicoes();
  }, [carregarRefeicoes]);

  // Calcula kcal e macros da porção, salva no servidor e atualiza a tela
  const adicionarAlimento = useCallback(async (refeicao: string, alimento: AlimentoBusca, gramas: number) => {
    if (!usuarioId) return; 

    const nome = alimento.nome;
    const kcal = calcularKcal(alimento.kcal_100g, gramas);
    
    try {
      const response = await apiFetch('/refeicoes/', {
        method: 'POST',
        body: JSON.stringify({
          usuario_id: usuarioId, 
          data_consumo: new Date().toISOString().split('T')[0],
          tipo_refeicao: refeicao,
          nome_alimento: nome,
          quantidade_gramas: gramas,
          calorias: kcal,
          carboidratos: porcao(alimento.carboidrato_100g, gramas),
          proteinas: porcao(alimento.proteina_100g, gramas),
          gorduras: porcao(alimento.gordura_100g, gramas),
        })
      });

      setRefeicoes((atual) => ({
        ...atual,
        [refeicao]: [
          ...(atual[refeicao] ?? []), 
          {
            id: response.id || Date.now(),
            nome,
            gramas,
            kcal,
            carboidratos: porcao(alimento.carboidrato_100g, gramas),
            proteinas: porcao(alimento.proteina_100g, gramas),
            gorduras: porcao(alimento.gordura_100g, gramas),
          }
        ],
      }));
    } catch (error) {
      console.error("Erro ao salvar refeição na API:", error);
    }
  }, [usuarioId]);

  // Remove o alimento no servidor e na tela
  const removerAlimento = useCallback(async (refeicao: string, id: string | number) => {
    try {
      await apiFetch(`/refeicoes/${id}`, { method: 'DELETE' });
      setRefeicoes((atual) => ({ 
        ...atual, 
        [refeicao]: (atual[refeicao] ?? []).filter((item) => item.id !== id) 
      }));
    } catch (error) {
      console.error("Erro ao deletar refeição na API:", error);
    }
  }, []);

  return (
    <RefeicoesContext.Provider value={{ refeicoes, adicionarAlimento, removerAlimento, totalConsumido, totaisMacros }}>
      {children}
    </RefeicoesContext.Provider>
  );
}

// Hook para as telas usarem o diário
export function useRefeicoes() {
  const ctx = useContext(RefeicoesContext);
  if (!ctx) throw new Error('useRefeicoes deve ser usado dentro de RefeicoesProvider');
  return ctx;
}