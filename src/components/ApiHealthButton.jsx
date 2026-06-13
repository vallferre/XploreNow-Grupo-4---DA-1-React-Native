import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BASE_URL } from '../services/authService';
import { pingApi } from '../services/robotService';

export default function ApiHealthButton() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState(null);

  const handlePress = useCallback(async () => {
    setChecking(true);
    setStatus(null);

    try {
      const data = await pingApi();
      if (data?.pong === true) {
        setStatus('ok');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setChecking(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, checking && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={checking}
        activeOpacity={0.8}
      >
        {checking ? (
          <ActivityIndicator color="#A8B3C7" size="small" />
        ) : (
          <Text style={styles.buttonText}>Probar conexion con la API</Text>
        )}
      </TouchableOpacity>

      {status === 'ok' ? (
        <View style={styles.okBox}>
          <Text style={styles.okText}>API conectada</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Sin conexion a la API</Text>
        </View>
      ) : null}

      <Text style={styles.urlHint}>{BASE_URL}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  button: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#233044',
    backgroundColor: '#1A2332',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#A8B3C7',
    fontSize: 14,
    fontWeight: '700',
  },
  okBox: {
    marginTop: 10,
    backgroundColor: '#102F20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#50E38A44',
    padding: 10,
  },
  okText: {
    color: '#50E38A',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorBox: {
    marginTop: 10,
    backgroundColor: '#37161B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B44',
    padding: 10,
  },
  errorText: {
    color: '#FF8A8A',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  urlHint: {
    marginTop: 8,
    color: '#5C6B85',
    fontSize: 11,
    textAlign: 'center',
  },
});
