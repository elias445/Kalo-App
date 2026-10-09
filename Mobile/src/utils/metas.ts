import { OBJETIVOS } from '../data/perfil';

export type Metas = { calorias: number; proteina: number; gordura: number; carboidrato: number };

// Mifflin-St Jeor com fator de atividade moderada (1,55) + ajuste do objetivo
export function calcularMetas(p: { peso: number; altura: number; idade: number; sexo: string; objetivo: string }): Metas {
  const peso = p.peso || 70;
  const altura = p.altura || 170;
  const idade = p.idade || 25;
  const ajuste = OBJETIVOS.find((o) => o.nome === p.objetivo)?.ajuste ?? 0;

  const base = 10 * peso + 6.25 * altura - 5 * idade + (p.sexo === 'Feminino' ? -161 : 5);
  const calorias = Math.round((base * 1.55 + ajuste) / 10) * 10;

  const proteina = Math.round(peso * 2);
  const gordura = Math.round((calorias * 0.25) / 9);
  const carboidrato = Math.round((calorias - proteina * 4 - gordura * 9) / 4);

  return { calorias, proteina, gordura, carboidrato };
}
