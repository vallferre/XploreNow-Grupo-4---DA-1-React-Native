import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../config/colors';
import { useAuth } from '../hooks/useAuth';
import { useRobotConnection } from '../hooks/useRobotConnection';

const ROBOTS = [
  {
    type: 'go2',
    title: 'Go2',
    subtitle: 'Cuadrupedo',
    accent: '#7C3AED',
    selectedBackground: '#171229',
    image: require('../../assets/robot-go2.png'),
  },
  {
    type: 'g1',
    title: 'G1',
    subtitle: 'Humanoide',
    accent: colors.secondary,
    selectedBackground: '#271D0B',
    image: require('../../assets/robot-g1.png'),
  },
];

const STATE_META = {
  connected: {
    label: 'Conectado',
    color: '#50E38A',
    backgroundColor: '#102F20',
  },
  disconnected: {
    label: 'Desconectado',
    color: '#8A94A6',
    backgroundColor: '#182232',
  },
  connecting: {
    label: 'Conectando',
    color: '#F5A623',
    backgroundColor: '#30250C',
  },
  error: {
    label: 'Error',
    color: '#FF6B6B',
    backgroundColor: '#37161B',
  },
};

export default function ConnectionScreen({ navigation }) {
  const { logout } = useAuth();
  const {
    robotType,
    setRobotType,
    networkInterface,
    setNetworkInterface,
    connectionState,
    error,
    loading,
    autoReconnect,
    isConnected,
    connect,
    disconnect,
    refreshStatus,
  } = useRobotConnection();

  const [menuOpen, setMenuOpen] = useState(false);
  const headerProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerProgress, {
      toValue: isConnected ? 1 : 0,
      duration: isConnected ? 1400 : 350,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerProgress, isConnected]);

  const headerGlowOpacity = headerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const headerFillOpacity = headerProgress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.45, 1],
  });

  useFocusEffect(
    useCallback(() => {
      refreshStatus({ allowReconnect: true }).catch(() => {});

      const intervalId = setInterval(() => {
        refreshStatus({ allowReconnect: true, silent: true }).catch(() => {});
      }, 10000);

      return () => clearInterval(intervalId);
    }, [refreshStatus])
  );

  const selectedRobot = ROBOTS.find((robot) => robot.type === robotType) || ROBOTS[0];
  const stateMeta = STATE_META[connectionState] || STATE_META.disconnected;

  const handleConnect = async () => {
    try {
      await connect();
      navigation.navigate('MovementControl');
    } catch {
      // El contexto deja el mensaje de error listo para mostrar en pantalla.
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch {
      // El contexto deja el mensaje de error listo para mostrar en pantalla.
    }
  };

  const handleProfilePress = () => {
    setMenuOpen(false);
    navigation.navigate('Profile');
  };

  const handleLogoutPress = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <View style={styles.flex}>
      <View style={styles.customHeader}>
        <Animated.View
          style={[
            styles.customHeaderGlow,
            {
              opacity: headerGlowOpacity,
              transform: [{ scaleX: headerProgress }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.customHeaderFill,
            {
              opacity: headerFillOpacity,
              transform: [{ scaleX: headerProgress }],
            },
          ]}
        />
        <Text style={styles.customHeaderTitle}>Conexion</Text>
        <TouchableOpacity
          style={styles.headerMenuButton}
          onPress={() => setMenuOpen((open) => !open)}
          activeOpacity={0.8}
        >
          <Text style={styles.headerMenuIcon}>...</Text>
        </TouchableOpacity>
        {menuOpen ? (
          <View style={styles.headerMenu}>
            <TouchableOpacity
              style={styles.headerMenuItem}
              onPress={handleProfilePress}
              activeOpacity={0.75}
            >
              <Text style={styles.headerMenuText}>Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerMenuItem, styles.headerMenuDangerItem]}
              onPress={handleLogoutPress}
              activeOpacity={0.75}
            >
              <Text style={[styles.headerMenuText, styles.headerMenuDangerText]}>
                Salir de la cuenta
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Pantalla de conexion</Text>
          <Text style={styles.subtitle}>Enlace operativo con API REST del robot</Text>
        </View>

        <View style={styles.statusPanel}>
          <View>
            <Text style={styles.statusLabel}>Estado actual</Text>
            <Text style={[styles.statusText, { color: stateMeta.color }]}>{stateMeta.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: stateMeta.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: stateMeta.color }]} />
            <Text style={[styles.statusBadgeText, { color: stateMeta.color }]}>
              {connectionState}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tipo de robot</Text>
        <View style={styles.robotGrid}>
          {ROBOTS.map((robot) => {
            const selected = robot.type === robotType;
            const locked = isConnected && !selected;
            return (
              <TouchableOpacity
                key={robot.type}
                style={[
                  styles.robotCard,
                  locked && styles.robotCardLocked,
                  selected && {
                    borderColor: robot.accent,
                    backgroundColor: robot.selectedBackground,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  if (!isConnected) setRobotType(robot.type);
                }}
                disabled={isConnected}
              >
                <View style={styles.robotImageFrame}>
                  <Image
                    source={robot.image}
                    style={[styles.robotImage, locked && styles.robotImageLocked]}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[
                    styles.robotTitle,
                    locked && styles.robotTextLocked,
                    selected && { color: robot.accent },
                  ]}
                >
                  {robot.title}
                </Text>
                <Text style={[styles.robotSubtitle, locked && styles.robotTextLocked]}>
                  {robot.subtitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Interfaz de red</Text>
          <TextInput
            style={styles.input}
            value={networkInterface}
            onChangeText={setNetworkInterface}
            placeholder="eth0"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.selectionSummary}>
          <Text style={styles.selectionLabel}>Configuracion seleccionada</Text>
          <Text style={styles.selectionText}>
            Robot {selectedRobot.title} por interfaz {networkInterface.trim() || 'eth0'}
          </Text>
          <Text style={styles.reconnectText}>
            Reconexion automatica: {autoReconnect ? 'activada' : 'desactivada'}
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!isConnected ? (
          <PrimaryButton title="Conectar" onPress={handleConnect} loading={loading} />
        ) : null}

        {isConnected ? (
          <TouchableOpacity
            style={[styles.secondaryButton, styles.disconnectButton, loading && styles.disabledButton]}
            onPress={handleDisconnect}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={[styles.secondaryButtonText, styles.disconnectButtonText]}>
              Desconectar
            </Text>
          </TouchableOpacity>
        ) : null}

        {isConnected ? (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.navigate('MovementControl')}
            activeOpacity={0.85}
          >
            <Text style={styles.controlButtonText}>Controlar Robot  →</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.diagnosticsButton}
          onPress={() => navigation.navigate('ConnectionDiagnostics')}
          activeOpacity={0.8}
        >
          <Text style={styles.diagnosticsButtonText}>Ver diagnostico JSON</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#07111F',
  },
  customHeader: {
    height: 104,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    paddingTop: 28,
    zIndex: 20,
    elevation: 20,
  },
  customHeaderGlow: {
    position: 'absolute',
    top: -18,
    bottom: -18,
    left: 0,
    right: 0,
    backgroundColor: '#6CFF9F',
  },
  customHeaderFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1FAE63',
  },
  customHeaderTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
  },
  headerMenuButton: {
    position: 'absolute',
    right: 18,
    bottom: 26,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerMenuIcon: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 18,
    marginTop: -8,
  },
  headerMenu: {
    position: 'absolute',
    right: 16,
    top: 88,
    width: 190,
    backgroundColor: '#101827',
    borderWidth: 1,
    borderColor: '#2D3A50',
    borderRadius: 12,
    padding: 6,
    zIndex: 10,
    elevation: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  headerMenuItem: {
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  headerMenuDangerItem: {
    backgroundColor: '#321419',
    marginTop: 4,
  },
  headerMenuText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  headerMenuDangerText: {
    color: '#FF6B6B',
  },
  container: {
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
    fontSize: 15,
    color: '#A8B3C7',
    marginTop: 4,
  },
  statusPanel: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#233044',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 13,
    color: '#A8B3C7',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 10,
  },
  robotGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  robotCard: {
    flex: 1,
    minHeight: 180,
    backgroundColor: '#101827',
    borderWidth: 2,
    borderColor: '#263348',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotCardLocked: {
    backgroundColor: '#121820',
    borderColor: '#242B35',
    opacity: 0.55,
  },
  robotImageFrame: {
    width: '100%',
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  robotImage: {
    width: '100%',
    height: '100%',
  },
  robotImageLocked: {
    opacity: 0.55,
  },
  robotTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
  },
  robotSubtitle: {
    fontSize: 13,
    color: '#A8B3C7',
    marginTop: 2,
  },
  robotTextLocked: {
    color: '#647084',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2D3A50',
    borderRadius: 10,
    backgroundColor: '#101827',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.white,
  },
  selectionSummary: {
    backgroundColor: '#101827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#233044',
  },
  selectionLabel: {
    fontSize: 12,
    color: '#A8B3C7',
    fontWeight: '700',
    marginBottom: 4,
  },
  selectionText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '700',
  },
  reconnectText: {
    fontSize: 13,
    color: '#A8B3C7',
    marginTop: 5,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#101827',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  disconnectButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    marginTop: 8,
  },
  disconnectButtonText: {
    color: colors.white,
  },
  controlButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  controlButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  diagnosticsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  diagnosticsButtonText: {
    color: '#A8B3C7',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
