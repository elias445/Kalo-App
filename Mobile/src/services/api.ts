import AsyncStorage from '@react-native-async-storage/async-storage';

// Endereço do servidor (definido no .env)
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Trava para evitar múltiplas chamadas simultâneas de renovação
let promessaDeRenovacao: Promise<string | null> | null = null;

// Tenta renovar o token de acesso usando o refresh token (sessão rotativa)
async function renovarTokenAcesso(): Promise<string | null> {
  if (promessaDeRenovacao) return promessaDeRenovacao;

  promessaDeRenovacao = (async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('@kalo_refresh_token');
      if (!refreshToken) return null;

      const resposta = await fetch(`${API_URL}/usuarios/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!resposta.ok) {
        await AsyncStorage.multiRemove(['@kalo_token', '@kalo_refresh_token', '@kalo_id', '@kalo_perfil']);
        return null;
      }

      const dados = await resposta.json();
      if (dados.token && dados.refresh_token) {
        await AsyncStorage.setItem('@kalo_token', dados.token);
        await AsyncStorage.setItem('@kalo_refresh_token', dados.refresh_token);
        return dados.token;
      }
      return null;
    } catch {
      return null;
    } finally {
      promessaDeRenovacao = null;
    }
  })();

  return promessaDeRenovacao;
}

// Faz a requisição ao servidor com renovação automática e silenciosa do token
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  let token = await AsyncStorage.getItem('@kalo_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  // Se o token expirou (401) em rotas autenticadas, tenta renovar silenciosamente e repetir a chamada
  if (response.status === 401 && !endpoint.includes('/usuarios/login') && !endpoint.includes('/usuarios/refresh')) {
    const novoToken = await renovarTokenAcesso();
    if (novoToken) {
      headers['Authorization'] = `Bearer ${novoToken}`;
      response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options?.headers,
        },
      });
    }
  }

  return response.json();
};