import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';

export const isBiometricAvailable = async () => {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
};

// Devuelve el tipo de biometría disponible para mostrar el label correcto
export const getBiometricLabel = async () => {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFaceId = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  return hasFaceId ? 'Face ID' : 'Huella dactilar';
};

export const authenticate = async () => {
  const label = await getBiometricLabel();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Autenticá con ${label}`,
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar contraseña',
    disableDeviceFallback: false,
  });
  return result.success;
};

export const saveBiometricCredentials = async (identifier, password) => {
  await SecureStore.setItemAsync(
    BIOMETRIC_CREDENTIALS_KEY,
    JSON.stringify({ identifier, password })
  );
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
};

export const getBiometricCredentials = async () => {
  const raw = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
};

export const isBiometricEnabled = async () => {
  const val = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return val === 'true';
};

export const disableBiometric = async () => {
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
};
