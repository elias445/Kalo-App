import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kalo_api_url';
const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.255.103:8000";

let currentApiUrl = DEFAULT_API_URL.trim().replace(/\/+$/, '');

/** Lê o endereço salvo no AsyncStorage ao abrir o app */
export const initApiUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentApiUrl = saved.trim().replace(/\/+$/, '');
    } else {
      currentApiUrl = DEFAULT_API_URL.trim().replace(/\/+$/, '');
    }
  } catch {
    currentApiUrl = DEFAULT_API_URL.trim().replace(/\/+$/, '');
  }
  return currentApiUrl;
};

/** Retorna a URL ativa no momento de forma síncrona */
export const getApiUrl = (): string => {
  return currentApiUrl;
};

/** Limpa espaços e barras extras no final, atualiza em memória e salva no AsyncStorage */
export const setApiUrl = async (newUrl: string): Promise<void> => {
  const cleaned = newUrl.trim().replace(/\/+$/, '');
  currentApiUrl = cleaned || DEFAULT_API_URL.trim().replace(/\/+$/, '');
  await AsyncStorage.setItem(STORAGE_KEY, currentApiUrl);
};

/** Remove a chave do AsyncStorage e restaura o valor padrão */
export const resetApiUrl = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
  currentApiUrl = DEFAULT_API_URL.trim().replace(/\/+$/, '');
};
