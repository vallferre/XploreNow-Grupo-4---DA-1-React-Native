import { useState, useEffect, useCallback } from 'react';
import {
  isBiometricAvailable,
  isBiometricEnabled,
  getBiometricLabel,
  authenticate,
  getBiometricCredentials,
  saveBiometricCredentials,
  disableBiometric,
} from '../services/biometricService';

export function useBiometric() {
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState('Biometría');

  useEffect(() => {
    const init = async () => {
      const hw = await isBiometricAvailable();
      setAvailable(hw);
      if (hw) {
        const [on, lbl] = await Promise.all([isBiometricEnabled(), getBiometricLabel()]);
        setEnabled(on);
        setLabel(lbl);
      }
    };
    init();
  }, []);

  const enable = useCallback(async (identifier, password) => {
    await saveBiometricCredentials(identifier, password);
    setEnabled(true);
  }, []);

  const disable = useCallback(async () => {
    await disableBiometric();
    setEnabled(false);
  }, []);

  // Autentica y devuelve las credenciales si tiene éxito
  const loginWithBiometric = useCallback(async () => {
    const success = await authenticate();
    if (!success) return null;
    return getBiometricCredentials();
  }, []);

  return { available, enabled, label, enable, disable, loginWithBiometric };
}
