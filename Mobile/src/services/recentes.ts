import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlimentoBusca } from '../data/alimentos';

// Quantidade máxima de alimentos recentes
const MAX_RECENTES = 8;

// Identificador único do alimento (fonte + id)
export const chaveDoAlimento = (a: AlimentoBusca) => `${a.fonte}:${a.id}`;

// Chave de armazenamento separada por usuário
const chaveStorage = (usuarioId: string | null) => `@kalo_recentes_${usuarioId ?? 'anonimo'}`;

// Lê os recentes salvos no celular
export async function carregarRecentes(usuarioId: string | null): Promise<AlimentoBusca[]> {
  try {
    const salvo = await AsyncStorage.getItem(chaveStorage(usuarioId));
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

// Grava a lista de recentes no celular
export async function salvarRecentes(usuarioId: string | null, lista: AlimentoBusca[]) {
  try {
    await AsyncStorage.setItem(chaveStorage(usuarioId), JSON.stringify(lista));
  } catch {
  }
}

// Coloca o alimento no topo da lista, sem repetir
export async function registrarRecente(usuarioId: string | null, alimento: AlimentoBusca): Promise<AlimentoBusca[]> {
  const atuais = await carregarRecentes(usuarioId);
  const lista = [alimento, ...atuais.filter((a) => chaveDoAlimento(a) !== chaveDoAlimento(alimento))].slice(0, MAX_RECENTES);
  await salvarRecentes(usuarioId, lista);
  return lista;
}
