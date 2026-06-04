import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import AuthInput from '../components/AuthInput';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../config/colors';
import { validateRegisterForm } from '../utils/validators';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setApiError('');
    const newErrors = validateRegisterForm({ username, email, password, confirmPassword });
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await register(username.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        'No se pudo completar el registro. El email o usuario ya puede estar en uso.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Completá tus datos para registrarte</Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="Nombre de usuario"
            value={username}
            onChangeText={setUsername}
            placeholder="juanperez"
            autoCapitalize="none"
            error={errors.username}
          />

          <AuthInput
            label="Email"
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

          <AuthInput
            label="Confirmar contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.confirmPassword}
          />

          {apiError ? (
            <View style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          <PrimaryButton title="Registrarse" onPress={handleRegister} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tenés cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Iniciá sesión</Text>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  subtitle: {
    fontSize: 15,
    color: '#A8B3C7',
    marginTop: 6,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#101827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#233044',
    padding: 24,
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
