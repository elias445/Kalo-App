import { OBJETIVOS } from '../data/perfil';

// Metas diárias de calorias e macros
export type Metas = { calorias: number; proteina: number; gordura: number; carboidrato: number };

// Calcula as metas com a fórmula de Mifflin-St Jeor
export function calcularMetas(p: { peso: number; altura: number; idade: number; sexo: string; objetivo: string }): Metas {
  const peso = p.peso || 70;
  const altura = p.altura || 170;
  const idade = p.idade || 25;
  // Ajuste de calorias do objetivo escolhido
  const ajuste = OBJETIVOS.find((o) => o.nome === p.objetivo)?.ajuste ?? 0;

  // Gasto basal (TMB)
  const base = 10 * peso + 6.25 * altura - 5 * idade + (p.sexo === 'Feminino' ? -161 : 5);
  // Gasto total com atividade moderada (x1,55) mais o ajuste
  const calorias = Math.round((base * 1.55 + ajuste) / 10) * 10;

  // Proteína: 2 g por kg de peso
  const proteina = Math.round(peso * 2);
  // Gordura: 25% das calorias (9 kcal por grama)
  const gordura = Math.round((calorias * 0.25) / 9);
  // Carboidrato: calorias que sobram (4 kcal por grama)
  const carboidrato = Math.round((calorias - proteina * 4 - gordura * 9) / 4);

  return { calorias, proteina, gordura, carboidrato };
}
