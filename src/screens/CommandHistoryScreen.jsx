import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../config/colors';
import { useCommandHistory } from '../hooks/useCommandHistory';

const formatTimestamp = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
};

export default function CommandHistoryScreen() {
  const { history, loadingHistory, historyError, refreshHistory } = useCommandHistory();

  useFocusEffect(
    useCallback(() => {
      refreshHistory().catch(() => {});
    }, [refreshHistory])
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loadingHistory}
          onRefresh={() => refreshHistory().catch(() => {})}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <Text style={styles.subtitle}>Comandos recuperados desde el servidor</Text>
      </View>

      {historyError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{historyError}</Text>
        </View>
      ) : null}

      {loadingHistory && history.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Consultando historial...</Text>
        </View>
      ) : null}

      {!loadingHistory && history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Todavia no hay comandos registrados</Text>
          <Text style={styles.emptySubtitle}>
            Cuando ejecutes acciones del robot, apareceran asociadas a tu cuenta.
          </Text>
        </View>
      ) : null}

      {history.map((entry) => (
        <View key={entry.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.commandName}>{entry.action}</Text>
            <View
              style={[
                styles.statusBadge,
                entry.success ? styles.successBadge : styles.errorBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  entry.success ? styles.successText : styles.errorStatusText,
                ]}
              >
                {entry.success ? 'Exito' : 'Fallo'}
              </Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{formatTimestamp(entry.timestamp)}</Text>
        </View>
      ))}
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
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  commandName: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  successBadge: {
    backgroundColor: colors.successLight,
  },
  errorBadge: {
    backgroundColor: colors.errorLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  successText: {
    color: colors.success,
  },
  errorStatusText: {
    color: colors.error,
  },
  timestamp: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
});
