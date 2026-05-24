import React, { useCallback } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../config/colors';
import { useRobotConnection } from '../hooks/useRobotConnection';

export default function ConnectionDiagnosticsScreen() {
  const { statusJson, error, loading, refreshStatus } = useRobotConnection();

  useFocusEffect(
    useCallback(() => {
      refreshStatus({ allowReconnect: false }).catch(() => {});
    }, [refreshStatus])
  );

  const handleRefresh = async () => {
    try {
      await refreshStatus({ allowReconnect: false });
    } catch {
      // El contexto deja el error listo para mostrar.
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Diagnostico</Text>
        <Text style={styles.subtitle}>Respuesta completa de GET /status</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.jsonBox}>
        <Text style={styles.jsonText}>
          {statusJson ? JSON.stringify(statusJson, null, 2) : 'Sin datos de estado todavia.'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleRefresh}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Actualizando...' : 'Actualizar estado'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  jsonBox: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 14,
    minHeight: 260,
  },
  jsonText: {
    color: '#E5E7EB',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    backgroundColor: colors.disabled,
  },
});
