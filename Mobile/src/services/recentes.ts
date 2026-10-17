import AsyncStorage from '@react-native-async-storage/async-storage';
import { AlimentoBusca } from '../data/alimentos';

const MAX_RECENTES = 8;

export const chaveDoAlimento = (a: AlimentoBusca) => `${a.fonte}:${a.id}`;

const chaveStorage = (usuarioId: string | null) => `@kalo_recentes_${usuarioId ?? 'anonimo'}`;

export async function carregarRecentes(usuarioId: string | null): Promise<AlimentoBusca[]> {
  try {
    const salvo = await AsyncStorage.getItem(chaveStorage(usuarioId));
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

export async function salvarRecentes(usuarioId: string | null, lista: AlimentoBusca[]) {
  try {
    await AsyncStorage.setItem(chaveStorage(usuarioId), JSON.stringify(lista));
  } catch {
  }
}

export async function registrarRecente(usuarioId: string | null, alimento: AlimentoBusca): Promise<AlimentoBusca[]> {
  const atuais = await carregarRecentes(usuarioId);
  const lista = [alimento, ...atuais.filter((a) => chaveDoAlimento(a) !== chaveDoAlimento(alimento))].slice(0, MAX_RECENTES);
  await salvarRecentes(usuarioId, lista);
  return lista;
}
