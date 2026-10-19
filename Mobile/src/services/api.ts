import AsyncStorage from '@react-native-async-storage/async-storage';

// Endereço do servidor (definido no .env)
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Faz a requisição ao servidor já enviando o token do usuário
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const token = await AsyncStorage.getItem('@kalo_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  return response.json();
};