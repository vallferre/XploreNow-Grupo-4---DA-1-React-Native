import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../config/colors';
import { useAuth } from '../hooks/useAuth';
import { useRobotConnection } from '../hooks/useRobotConnection';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const {
    sensitivity,
    adjustSensitivity,
    sensitivityMin,
    sensitivityMax,
    sensitivityStep,
  } = useRobotConnection();
  const identifier = user?.identifier || user?.email || user?.username || 'Usuario autenticado';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{identifier.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>{identifier}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informacion de la cuenta</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Usuario</Text>
          <Text style={styles.value}>{identifier}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sesion</Text>
          <Text style={styles.value}>Activa</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sensibilidad de movimiento</Text>
        <View style={styles.sensRow}>
          <Text style={styles.sensLabel}>Velocidad del joystick y D-Pad</Text>
          <View style={styles.sensControls}>
            <TouchableOpacity
              style={[styles.sensBtn, sensitivity <= sensitivityMin && styles.disabled]}
              onPress={() => adjustSensitivity(-sensitivityStep)}
              disabled={sensitivity <= sensitivityMin}
              activeOpacity={0.7}
            >
              <Text style={styles.sensBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.sensValue}>{Math.round(sensitivity * 100)}%</Text>
            <TouchableOpacity
              style={[styles.sensBtn, sensitivity >= sensitivityMax && styles.disabled]}
              onPress={() => adjustSensitivity(sensitivityStep)}
              disabled={sensitivity >= sensitivityMax}
              activeOpacity={0.7}
            >
              <Text style={styles.sensBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sensHint}>
          Ajustá qué tan rápido responde el robot a los controles del joystick virtual.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => navigation.navigate('CommandHistory')}
        activeOpacity={0.8}
      >
        <Text style={styles.historyText}>Ver historial de comandos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Salir de la cuenta</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102F20',
    borderWidth: 1,
    borderColor: '#50E38A',
  },
  avatarText: {
    color: '#50E38A',
    fontSize: 24,
    fontWeight: '900',
  },
  headerText: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#A8B3C7',
    fontSize: 14,
    marginTop: 3,
  },
  card: {
    backgroundColor: '#101827',
    borderWidth: 1,
    borderColor: '#233044',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  cardTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: '#233044',
    paddingVertical: 12,
  },
  label: {
    color: '#A8B3C7',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  value: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  sensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sensLabel: {
    flex: 1,
    color: '#A8B3C7',
    fontSize: 13,
    fontWeight: '700',
  },
  sensControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sensBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1A2332',
    borderWidth: 1,
    borderColor: '#2D3A50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  sensValue: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    minWidth: 46,
    textAlign: 'center',
  },
  sensHint: {
    color: '#5C6B85',
    fontSize: 12,
    marginTop: 12,
  },
  disabled: {
    opacity: 0.35,
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  historyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
});
