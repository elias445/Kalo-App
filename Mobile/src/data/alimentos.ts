export type Alimento = { nome: string; kcal100: number };

export const ALIMENTOS: Alimento[] = [
  { nome: 'Arroz', kcal100: 130 },
  { nome: 'Feijão', kcal100: 75 },
  { nome: 'Macarrão', kcal100: 158 },
  { nome: 'Banana', kcal100: 89 },
  { nome: 'Frango grelhado', kcal100: 165 },
  { nome: 'Carne moída', kcal100: 250 },
  { nome: 'Ovo cozido', kcal100: 155 },
  { nome: 'Pão francês', kcal100: 300 },
  { nome: 'Aveia', kcal100: 389 },
  { nome: 'Batata doce', kcal100: 86 },
  { nome: 'Inhame', kcal100: 115 },
  { nome: 'Leite integral', kcal100: 61 },
  { nome: 'Maçã', kcal100: 52 },
  { nome: 'Whey protein', kcal100: 380 },
];

export const calcularKcal = (kcal100: number, gramas: number) => Math.round((kcal100 * gramas) / 100);

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

export const porcao = (valor100: number, gramas: number) => Math.round(((valor100 * gramas) / 100) * 10) / 10;
