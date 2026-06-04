import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import colors from '../config/colors';

export default function BiometricButton({ label, onPress }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>o</Text>
        <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.75}>
        <Text style={styles.icon}>
          {label === 'Face ID' ? '🪪' : '🫆'}
        </Text>
        <Text style={styles.label}>Iniciar sesión con {label}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#233044',
  },
  orText: {
    marginHorizontal: 10,
    color: '#A8B3C7',
    fontSize: 13,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
