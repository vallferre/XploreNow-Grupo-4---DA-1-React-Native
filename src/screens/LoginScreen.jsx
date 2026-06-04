import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useBiometric } from '../hooks/useBiometric';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';
import BiometricButton from '../components/BiometricButton';
import colors from '../config/colors';
import { validateLoginForm } from '../utils/validators';

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const { available, enabled, label, enable, loginWithBiometric } = useBiometric();

  const registeredOk = route?.params?.registered === true;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = useCallback(async (identifier, pwd) => {
    await login(identifier.trim().toLowerCase(), pwd);
  }, [login]);

  const offerBiometricSetup = useCallback((identifier, pwd) => {
    Alert.alert(
      `Activar ${label}`,
      `¿Querés usar ${label} para iniciar sesión más rápido la próxima vez?`,
      [
        { text: 'Ahora no', style: 'cancel' },
        {
          text: 'Activar',
          onPress: () => enable(identifier.trim().toLowerCase(), pwd),
        },
      ]
    );
  }, [label, enable]);

  const handleLogin = useCallback(async () => {
    setApiError('');
    const newErrors = validateLoginForm({ identifier: email, password });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await performLogin(email, password);
      if (available && !enabled) {
        offerBiometricSetup(email, password);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'Credenciales incorrectas. Verificá tu email y contraseña.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, [email, password, available, enabled, performLogin, offerBiometricSetup]);

  const handleBiometricLogin = useCallback(async () => {
    setApiError('');
    setLoading(true);
    try {
      const credentials = await loginWithBiometric();
      if (!credentials) return;
      await performLogin(credentials.identifier, credentials.password);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudo iniciar sesión. Intentá con tu contraseña.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, [loginWithBiometric, performLogin]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>MegaBot V2</Text>
          <Text style={styles.subtitle}>Iniciá sesión para continuar</Text>
        </View>

        {registeredOk ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Cuenta creada. ¡Ya podés iniciar sesión!</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <AuthInput
            label="Email o usuario"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email}
          />

          <AuthInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Iniciar sesión" onPress={handleLogin} loading={loading} />

          {/* Botón de biometría: visible solo si el hardware está disponible y el usuario lo activó */}
          {available && enabled ? (
            <BiometricButton label={label} onPress={handleBiometricLogin} />
          ) : null}

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Registrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#A8B3C7',
    marginTop: 6,
  },
  form: {
    backgroundColor: '#101827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#233044',
    padding: 24,
  },
  successBox: {
    backgroundColor: '#102F20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#50E38A44',
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#50E38A',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  apiErrorBox: {
    backgroundColor: '#37161B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B44',
    padding: 12,
    marginBottom: 12,
  },
  apiErrorText: {
    color: '#FF8A8A',
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#A8B3C7',
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
