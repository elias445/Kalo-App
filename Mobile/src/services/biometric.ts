
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
