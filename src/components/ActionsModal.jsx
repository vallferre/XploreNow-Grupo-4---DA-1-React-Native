import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import colors from '../config/colors';
import { executeAction, getAvailableActions } from '../services/robotService';

const MODAL_ORIENTATIONS = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
];

const ACTION_LABELS = {
  hello: 'Saludar',
  stretch: 'Estirar',
  dance1: 'Baile 1',
  dance2: 'Baile 2',
  heart: 'Corazón',
  left_flip: 'Voltereta izq.',
  back_flip: 'Voltereta atrás',
  front_flip: 'Voltereta adelante',
  balance_stand: 'Balance',
  recovery_stand: 'Recuperación',
  free_walk: 'Caminar libre',
  wave_hand: 'Saludar con mano',
  wave_hand_turn: 'Saludar girando',
  shake_hand: 'Apretón de manos',
  high_stand: 'Posición alta',
  low_stand: 'Posición baja',
  release_arm: 'Liberar brazos',
  shake_hand_arm: 'Apretón (brazos)',
  high_five: 'Chocar los cinco',
  hug: 'Abrazo',
  high_wave: 'Saludo alto',
  clap: 'Aplaudir',
  face_wave: 'Saludo facial',
  left_kiss: 'Beso izquierdo',
  right_heart: 'Corazón derecho',
  hands_up: 'Manos arriba',
  x_ray: 'Rayos X',
  right_hand_up: 'Mano derecha arriba',
  reject: 'Rechazar',
  right_kiss: 'Beso derecho',
  two_hand_kiss: 'Beso con dos manos',
};

const ACTION_ACCENTS = {
  hello:          '#1A73E8',
  stretch:        '#50E38A',
  dance1:         '#7C3AED',
  dance2:         '#7C3AED',
  heart:          '#E91E63',
  left_flip:      '#F5A623',
  back_flip:      '#F5A623',
  front_flip:     '#F5A623',
  balance_stand:  '#50E38A',
  recovery_stand: '#50E38A',
  free_walk:      '#1A73E8',
  wave_hand:      '#1A73E8',
  wave_hand_turn: '#1A73E8',
  shake_hand:     '#1A73E8',
  high_stand:     '#1558B0',
  low_stand:      '#1558B0',
  release_arm:    '#50E38A',
  shake_hand_arm: '#50E38A',
  high_five:      '#F5A623',
  hug:            '#E91E63',
  high_wave:      '#1A73E8',
  clap:           '#7C3AED',
  face_wave:      '#1A73E8',
  left_kiss:      '#E91E63',
  right_heart:    '#E91E63',
  hands_up:       '#F5A623',
  x_ray:          '#50E38A',
  right_hand_up:  '#F5A623',
  reject:         '#FF6B6B',
  right_kiss:     '#E91E63',
  two_hand_kiss:  '#E91E63',
};

const DEFAULT_ACCENT = '#2D3A50';

function formatActionLabel(name) {
  if (typeof name !== 'string') return 'Acción';
  if (ACTION_LABELS[name]) return ACTION_LABELS[name];
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getActionAccent(name) {
  return ACTION_ACCENTS[name] ?? DEFAULT_ACCENT;
}

function getActionInitial(name) {
  const label = formatActionLabel(name);
  return label.charAt(0).toUpperCase();
}

function ActionCard({ name, executing, disabled, onPress }) {
  const accent = getActionAccent(name);
  const isRunning = executing === name;
  const isDisabled = disabled && !isRunning;

  return (
    <TouchableOpacity
      style={[
        styles.actionCard,
        { borderColor: isRunning ? accent : '#2D3A50' },
        isRunning && { backgroundColor: accent + '18' },
        isDisabled && styles.actionCardDisabled,
      ]}
      onPress={() => onPress(name)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
        {isRunning
          ? <ActivityIndicator color={accent} size="small" />
          : <Text style={[styles.iconInitial, { color: accent }]}>{getActionInitial(name)}</Text>}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.actionLabel} numberOfLines={2}>
          {formatActionLabel(name)}
        </Text>
        <View style={[styles.accentDot, { backgroundColor: accent }]} />
      </View>

      {!isRunning && (
        <View style={[styles.playBadge, { backgroundColor: accent + '22' }]}>
          <Text style={[styles.playIcon, { color: accent }]}>{'>'}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ActionsModal({ visible, onClose, isConnected, onFeedback }) {
  const [actions, setActions] = useState([]);
  const [robotType, setRobotType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [executing, setExecuting] = useState(null);

  const loadActions = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getAvailableActions();
      setActions(Array.isArray(data.actions) ? data.actions : []);
      setRobotType(data.robot_type ?? '');
    } catch {
      setLoadError('No se pudieron cargar las acciones del robot.');
      setActions([]);
      setRobotType('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible && isConnected) {
      loadActions();
    }
    if (!visible) {
      setExecuting(null);
      setLoadError('');
      setActions([]);
      setRobotType('');
    }
  }, [visible, isConnected, loadActions]);

  const handleExecute = async (name) => {
    setExecuting(name);
    try {
      await executeAction(name);
      onFeedback?.('success', `${formatActionLabel(name)} ejecutada`);
      onClose();
    } catch {
      onFeedback?.('error', `Error al ejecutar ${formatActionLabel(name)}`);
    } finally {
      setExecuting(null);
    }
  };

  const robotLabel = robotType === 'go2' ? 'Unitree Go2' : robotType === 'g1' ? 'Unitree G1' : 'Robot';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={MODAL_ORIENTATIONS}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTap} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>
          <View style={styles.headerAccent} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Acciones</Text>
              <Text style={styles.subtitle}>
                {loading
                  ? 'Cargando...'
                  : `${actions.length} disponible${actions.length !== 1 ? 's' : ''} · ${robotLabel}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <Text style={styles.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color="#50E38A" size="large" />
              <Text style={styles.hint}>Obteniendo acciones del robot...</Text>
            </View>
          ) : loadError ? (
            <View style={styles.centered}>
              <Text style={styles.errorText}>{loadError}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadActions}>
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : actions.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.hint}>No hay acciones disponibles.</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.grid}>
                {actions.map((item) => (
                  <ActionCard
                    key={item}
                    name={item}
                    executing={executing}
                    disabled={executing !== null}
                    onPress={handleExecute}
                  />
                ))}
              </View>
            </ScrollView>
          )}

          {!loading && actions.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Tocá una acción para ejecutarla en el robot</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 20, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    backgroundColor: '#0C1524',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2D3A50',
    overflow: 'hidden',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  headerAccent: {
    height: 3,
    backgroundColor: '#50E38A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3D',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#6B7A94',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A2438',
    borderWidth: 1,
    borderColor: '#2D3A50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeBtnText: {
    color: '#A8B3C7',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  list: {
    maxHeight: 340,
  },
  listContent: {
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#07111F',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  actionCardDisabled: {
    opacity: 0.45,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconInitial: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  accentDot: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  playBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  playIcon: {
    fontSize: 12,
    fontWeight: '900',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#1E2A3D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#07111F',
  },
  footerText: {
    color: '#6B7A94',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    gap: 10,
  },
  hint: {
    color: '#A8B3C7',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#1558B0',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 9,
    marginTop: 4,
  },
  retryText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
