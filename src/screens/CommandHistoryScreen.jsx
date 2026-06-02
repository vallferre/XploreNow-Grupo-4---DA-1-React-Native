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
        <Text style={styles.subtitle}>Comandos guardados en tu cuenta en este dispositivo</Text>
      </View>

      {historyError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{historyError}</Text>
        </View>
      ) : null}

      {loadingHistory && history.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      ) : null}

      {!loadingHistory && history.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Todavia no hay comandos registrados</Text>
          <Text style={styles.emptySubtitle}>
            Cuando ejecutes acciones del robot, quedaran registradas asociadas a tu usuario.
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
    backgroundColor: '#07111F',
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: '#A8B3C7',
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: '#37161B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#5B252D',
  },
  errorText: {
    color: '#FF6B6B',
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
    color: '#A8B3C7',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#101827',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#233044',
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    color: '#A8B3C7',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#101827',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#233044',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  commandName: {
    flex: 1,
    color: colors.white,
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
    backgroundColor: '#102F20',
  },
  errorBadge: {
    backgroundColor: '#37161B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  successText: {
    color: '#50E38A',
  },
  errorStatusText: {
    color: '#FF6B6B',
  },
  timestamp: {
    color: '#A8B3C7',
    fontSize: 13,
    marginTop: 10,
  },
});
