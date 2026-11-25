import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api';
import { CommonActions } from '@react-navigation/native';

/** Verifica se o dispositivo possui hardware biométrico e se há credenciais registradas */
export const isBiometricSupported = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
};

/** autenticação biométrica (Face ID / Fingerprint) */
export const authenticate = async (promptMessage = 'Desbloquear com biometria'): Promise<boolean> => {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Usar senha',
    disableDeviceFallback: false,
  });
  return result.success;
};

/** Persiste a flag indicando que o usuário habilitou biometria */
export const storeBiometricEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem('@kalo_biometric_enabled', enabled ? 'true' : 'false');
};

/** Lê a flag persistida */
export const getBiometricEnabled = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem('@kalo_biometric_enabled');
  return value === 'true';
};

/** Remove todos os tokens e dados da sessão no logout */
export const limparTokensLogout = async (): Promise<void> => {
  await AsyncStorage.multiRemove(['@kalo_token', '@kalo_refresh_token', '@kalo_id', '@kalo_perfil']);
};

/** Executa o fluxo biométrico na inicialização do app */
export const verificarFluxoBiometricoInicial = async (navigationRef: any): Promise<boolean> => {
  try {
    const refreshToken = await AsyncStorage.getItem('@kalo_refresh_token');
    if (!refreshToken) return false;

    const ok = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Desbloquear Kalo',
      fallbackLabel: 'Usar senha',
      disableDeviceFallback: false,
    });
    if (!ok.success) return false;

    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/usuarios/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.status === 200) {
      const data = await response.json();
      if (data.token && data.refresh_token) {
        await AsyncStorage.setItem('@kalo_token', data.token);
        await AsyncStorage.setItem('@kalo_refresh_token', data.refresh_token);
      }
      if (navigationRef && navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
      }
      return true;
    } else if (response.status === 401) {
      await AsyncStorage.multiRemove(['@kalo_token', '@kalo_refresh_token', '@kalo_id', '@kalo_perfil']);
      return false;
    } else {
      return false;
    }
  } catch (error) {
    // Se falhar por rede offline, NÃO apagar os tokens
    console.error('Erro na verificação biométrica inicial:', error);
    return false;
  }
};
