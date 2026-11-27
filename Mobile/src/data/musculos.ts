// Endereço dos desenhos de corpo e de músculos do wger
export const URL_MUSCULOS = 'https://wger.de/static/images/muscles';
export const BASE_FRENTE = `${URL_MUSCULOS}/muscular_system_front.svg`;
export const BASE_COSTAS = `${URL_MUSCULOS}/muscular_system_back.svg`;

// Cada músculo (nome em português) com o número do desenho no wger e o lado do corpo onde aparece
export const MUSCULOS: Record<string, { id: number; frente: boolean }> = {
  'Bíceps': { id: 1, frente: true },
  'Ombros': { id: 2, frente: true },
  'Serrátil anterior': { id: 3, frente: true },
  'Peitoral': { id: 4, frente: true },
  'Tríceps': { id: 5, frente: false },
  'Abdômen': { id: 6, frente: true },
  'Panturrilha': { id: 7, frente: false },
  'Glúteos': { id: 8, frente: false },
  'Trapézio': { id: 9, frente: false },
  'Quadríceps': { id: 10, frente: true },
  'Posterior da coxa': { id: 11, frente: false },
  'Dorsais': { id: 12, frente: false },
  'Braquial': { id: 13, frente: true },
  'Oblíquos': { id: 14, frente: true },
  'Sóleo': { id: 15, frente: false },
};
