import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRobotConnection } from '../hooks/useRobotConnection';

const STATUS_META = {
  connected: {
    label: 'Conectado',
    color: '#50E38A',
    backgroundColor: 'rgba(80, 227, 138, 0.18)',
  },
  disconnected: {
    label: 'Desconectado',
    color: '#D1D5DB',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  error: {
    label: 'Error',
    color: '#FF8A8A',
    backgroundColor: 'rgba(255, 107, 107, 0.18)',
  },
};

export default function ConnectionStatusBadge({ compact = false }) {
  const { connectionState } = useRobotConnection();
  const meta = STATUS_META[connectionState] || STATUS_META.disconnected;

  return (
    <View style={[styles.badge, { backgroundColor: meta.backgroundColor }, compact && styles.compact]}>
      <View style={[styles.dot, { backgroundColor: meta.color }]} />
      <Text style={[styles.label, { color: meta.color }]} numberOfLines={1}>
        {compact ? meta.label : `Robot ${meta.label}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  compact: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
  },
});
