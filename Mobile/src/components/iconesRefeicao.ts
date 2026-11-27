import { Coffee, Apple, Utensils, Sandwich, Soup, Moon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

// Ícone de cada refeição
export const ICONES_REFEICAO: Record<string, LucideIcon> = {
  'Café da manhã': Coffee,
  'Lanche da manhã': Apple,
  'Almoço': Utensils,
  'Lanche da tarde': Sandwich,
  'Jantar': Soup,
  'Ceia': Moon,
};
