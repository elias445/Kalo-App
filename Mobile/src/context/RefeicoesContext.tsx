import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { ALIMENTOS, calcularKcal } from '../data/alimentos';

export type ItemRefeicao = { id: string | number; nome: string; gramas: number; kcal: number };

type RefeicoesState = {
  refeicoes: Record<string, ItemRefeicao[]>;
  adicionarAlimento: (refeicao: string, nome: string, gramas: number) => Promise<void>;
  removerAlimento: (refeicao: string, id: string | number) => void;
  totalConsumido: number;
};

const RefeicoesContext = createContext<RefeicoesState | null>(null);

export function RefeicoesProvider({ children }: { children: React.ReactNode }) {
  const [refeicoes, setRefeicoes] = useState<Record<string, ItemRefeicao[]>>({
    'Café da manhã': [],
    'Lanche da manhã': [],
    'Almoço': [],
    'Lanche da tarde': [],
    'Jantar': [],
    'Ceia': [],
  });

  const totalConsumido = Object.values(refeicoes).flat().reduce((soma, item) => soma + item.kcal, 0);
  const usuarioIdFixo = "a3f9c3f5-ed2f-451e-a1b6-74ed71a334bf";

  const carregarRefeicoes = useCallback(async () => {
    try {
      const dadosBanco = await apiFetch(`/refeicoes/usuario/${usuarioIdFixo}`); 
      
      const refeicoesAgrupadas: Record<string, ItemRefeicao[]> = {
        'Café da manhã': [],
        'Lanche da manhã': [],
        'Almoço': [],
        'Lanche da tarde': [],
        'Jantar': [],
        'Ceia': [],
      };

      dadosBanco.forEach((item: any) => {
        if (refeicoesAgrupadas[item.tipo_refeicao]) {
          refeicoesAgrupadas[item.tipo_refeicao].push({
            id: item.id,
            nome: item.nome_alimento,
            gramas: item.quantidade_gramas,
            kcal: item.calorias
          });
        }
      });

      setRefeicoes(refeicoesAgrupadas);
    } catch (error) {
      console.error("Erro ao carregar refeições do banco:", error);
    }
  }, []);


  useEffect(() => {
    carregarRefeicoes();
  }, [carregarRefeicoes]);


  const adicionarAlimento = useCallback(async (refeicao: string, nome: string, gramas: number) => {
    const alimento = ALIMENTOS.find((a) => a.nome === nome);
    const kcal = calcularKcal(alimento?.kcal100 ?? 100, gramas);
    

    const usuarioIdFixo = "a3f9c3f5-ed2f-451e-a1b6-74ed71a334bf"; 

    try {
      
      const response = await apiFetch('/refeicoes/', {
        method: 'POST',
        body: JSON.stringify({
          usuario_id: usuarioIdFixo,
          data_consumo: new Date().toISOString().split('T')[0],
          tipo_refeicao: refeicao,
          nome_alimento: nome,
          quantidade_gramas: gramas,
          calorias: kcal,
          carboidratos: 20.0, 
          proteinas: 10.0,
          gorduras: 5.0
        })
      });

      
      setRefeicoes((atual) => ({
        ...atual,
        [refeicao]: [
          ...(atual[refeicao] ?? []), 
          { id: response.id || Date.now(), nome, gramas, kcal }
        ],
      }));
    } catch (error) {
      console.error("Erro ao salvar refeição na API:", error);
    }
  }, []);

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
    <RefeicoesContext.Provider value={{ refeicoes, adicionarAlimento, removerAlimento, totalConsumido }}>
      {children}
    </RefeicoesContext.Provider>
  );
}

export function useRefeicoes() {
  const ctx = useContext(RefeicoesContext);
  if (!ctx) throw new Error('useRefeicoes deve ser usado dentro de RefeicoesProvider');
  return ctx;
}