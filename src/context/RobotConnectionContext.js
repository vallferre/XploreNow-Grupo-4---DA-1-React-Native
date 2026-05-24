import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  connectRobot as apiConnectRobot,
  disconnectRobot as apiDisconnectRobot,
  getStatus,
} from '../services/robotService';

const STORAGE_KEY = '@xplore_robot_connection';
const DEFAULT_ROBOT_TYPE = 'go2';
const DEFAULT_NETWORK_INTERFACE = 'eth0';

export const RobotConnectionContext = createContext(null);

const normalizeInterface = (value = '') => String(value).trim() || DEFAULT_NETWORK_INTERFACE;

const getErrorMessage = (error) => {
  const status = error?.response?.status;
  const apiError = error?.response?.data?.error;
  const detail = error?.response?.data?.detail;

  if (status === 401) return 'Sesion expirada o token invalido. Volve a iniciar sesion.';
  if (apiError === 'ALREADY_CONNECTED') return 'Ya hay un robot conectado.';
  if (apiError === 'NOT_CONNECTED') return 'El robot ya esta desconectado.';
  if (apiError === 'SDK_ERROR') return 'La API no pudo comunicarse con el robot.';
  if (error?.message === 'Network Error') return 'No se pudo conectar con la API del robot.';
  return detail || apiError || 'Ocurrio un error al comunicarse con la API.';
};

export function RobotConnectionProvider({ children }) {
  const [robotType, setRobotType] = useState(DEFAULT_ROBOT_TYPE);
  const [networkInterface, setNetworkInterface] = useState(DEFAULT_NETWORK_INTERFACE);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [statusJson, setStatusJson] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoReconnect, setAutoReconnect] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const reconnectingRef = useRef(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const config = JSON.parse(stored);
          if (config.robotType === 'go2' || config.robotType === 'g1') {
            setRobotType(config.robotType);
          }
          if (typeof config.networkInterface === 'string') {
            setNetworkInterface(normalizeInterface(config.networkInterface));
          }
          setAutoReconnect(config.autoReconnect === true);
        }
      } catch {
        // Configuracion corrupta: se usan los defaults.
      } finally {
        setSettingsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ robotType, networkInterface, autoReconnect })
    ).catch(() => {});
  }, [autoReconnect, networkInterface, robotType, settingsLoaded]);

  const applyStatus = useCallback((status) => {
    setStatusJson(status);
    setConnectionState(status?.connection_state || 'disconnected');

    if (status?.robot_type === 'go2' || status?.robot_type === 'g1') {
      setRobotType(status.robot_type);
    }
    if (status?.network_interface) {
      setNetworkInterface(status.network_interface);
    }
    setError(status?.last_error || '');
  }, []);

  const connect = useCallback(async ({ manual = true } = {}) => {
    const iface = normalizeInterface(networkInterface);
    setLoading(true);
    setError('');

    try {
      const response = await apiConnectRobot(robotType, iface);
      const connectedStatus = {
        connection_state: 'connected',
        robot_type: response.robot_type,
        network_interface: iface,
        connected_at: response.connected_at,
        last_error: null,
      };

      applyStatus(connectedStatus);
      if (manual) setAutoReconnect(true);
      return connectedStatus;
    } catch (err) {
      if (err?.response?.data?.error === 'ALREADY_CONNECTED') {
        const currentStatus = await getStatus();
        applyStatus(currentStatus);
        if (manual && currentStatus.connection_state === 'connected') {
          setAutoReconnect(true);
        }
        return currentStatus;
      }

      setConnectionState('error');
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applyStatus, networkInterface, robotType]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError('');
    setAutoReconnect(false);

    try {
      await apiDisconnectRobot();
      const disconnectedStatus = {
        connection_state: 'disconnected',
        robot_type: null,
        network_interface: null,
        connected_at: null,
        last_error: null,
      };
      applyStatus(disconnectedStatus);
      return disconnectedStatus;
    } catch (err) {
      if (err?.response?.data?.error === 'NOT_CONNECTED') {
        const disconnectedStatus = {
          connection_state: 'disconnected',
          robot_type: null,
          network_interface: null,
          connected_at: null,
          last_error: null,
        };
        applyStatus(disconnectedStatus);
        return disconnectedStatus;
      }

      setConnectionState('error');
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applyStatus]);

  const refreshStatus = useCallback(async ({ allowReconnect = true, silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');

    try {
      const status = await getStatus();
      applyStatus(status);

      const lostConnection =
        status.connection_state === 'disconnected' || status.connection_state === 'error';

      if (allowReconnect && autoReconnect && lostConnection && !reconnectingRef.current) {
        reconnectingRef.current = true;
        setError('Se perdio la conexion. Intentando reconectar...');
        try {
          return await connect({ manual: false });
        } finally {
          reconnectingRef.current = false;
        }
      }

      return status;
    } catch (err) {
      setConnectionState('error');
      setError(getErrorMessage(err));
      throw err;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [applyStatus, autoReconnect, connect]);

  const value = useMemo(() => ({
    robotType,
    setRobotType,
    networkInterface,
    setNetworkInterface,
    connectionState,
    statusJson,
    error,
    loading,
    autoReconnect,
    isConnected: connectionState === 'connected',
    connect,
    disconnect,
    refreshStatus,
  }), [
    autoReconnect,
    connect,
    connectionState,
    disconnect,
    error,
    loading,
    networkInterface,
    refreshStatus,
    robotType,
    statusJson,
  ]);

  return (
    <RobotConnectionContext.Provider value={value}>
      {children}
    </RobotConnectionContext.Provider>
  );
}
