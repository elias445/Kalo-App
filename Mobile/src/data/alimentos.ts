// Calorias para a quantidade em gramas
export const calcularKcal = (kcal100: number, gramas: number) => Math.round((kcal100 * gramas) / 100);

// Alimento devolvido pela busca do servidor
export type AlimentoBusca = {
  id: string;
  nome: string;
  categoria: string | null;
  fonte: 'TACO' | 'OPEN_FOOD_FACTS';
  kcal_100g: number;
  proteina_100g: number;
  carboidrato_100g: number;
  gordura_100g: number;
  fibra_100g: number;
  nutrientes?: Record<string, number>;
  porcao_g?: number | null;
  porcao_descricao?: string | null;
  embalagem_g?: number | null;
};

// Valor de um nutriente para a quantidade em gramas
export const porcao = (valor100: number, gramas: number) => Math.round(((valor100 * gramas) / 100) * 10) / 10;
