import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { executeAction, moveRobot, sitDown, standUp, stopRobot } from '../services/robotService';
import { getCommandHistory } from '../services/historyService';

export const CommandHistoryContext = createContext(null);

const getHistoryErrorMessage = (error) => {
  if (error?.response?.status === 404) return 'La API no expone historial de comandos.';
  if (error?.response?.status === 401) return 'Tu sesion vencio. Volve a iniciar sesion.';
  if (error?.message === 'Network Error') return 'No se pudo consultar el historial.';
  return error?.response?.data?.detail || 'No se pudo cargar el historial de comandos.';
};

export function CommandHistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const refreshTimeoutRef = useRef(null);

  const refreshHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingHistory(true);
    setHistoryError('');

    try {
      const nextHistory = await getCommandHistory();
      setHistory(nextHistory);
      return nextHistory;
    } catch (error) {
      setHistoryError(getHistoryErrorMessage(error));
      throw error;
    } finally {
      if (!silent) setLoadingHistory(false);
    }
  }, []);

  const scheduleHistoryRefresh = useCallback((delayMs = 350) => {
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      refreshHistory({ silent: true }).catch(() => {});
    }, delayMs);
  }, [refreshHistory]);

  useEffect(() => () => clearTimeout(refreshTimeoutRef.current), []);

  const executeTrackedCommand = useCallback(async (actionLabel, executor, options = {}) => {
    const {
      refresh = true,
      refreshDelayMs = 350,
    } = options;

    const result = await executor();
    if (refresh) {
      scheduleHistoryRefresh(refreshDelayMs);
    }
    return {
      action: actionLabel,
      result,
    };
  }, [scheduleHistoryRefresh]);

  const sendMove = useCallback((vx, vy, vyaw) => (
    executeTrackedCommand('move', () => moveRobot(vx, vy, vyaw), { refresh: false })
  ), [executeTrackedCommand]);

  const sendStop = useCallback(() => (
    executeTrackedCommand('stop', () => stopRobot())
  ), [executeTrackedCommand]);

  const sendStandUp = useCallback(() => (
    executeTrackedCommand('standup', () => standUp())
  ), [executeTrackedCommand]);

  const sendSitDown = useCallback(() => (
    executeTrackedCommand('sitdown', () => sitDown())
  ), [executeTrackedCommand]);

  const sendAction = useCallback((actionName) => (
    executeTrackedCommand(actionName, () => executeAction(actionName))
  ), [executeTrackedCommand]);

  const value = useMemo(() => ({
    history,
    loadingHistory,
    historyError,
    refreshHistory,
    sendMove,
    sendStop,
    sendStandUp,
    sendSitDown,
    sendAction,
  }), [
    history,
    historyError,
    loadingHistory,
    refreshHistory,
    sendAction,
    sendMove,
    sendSitDown,
    sendStandUp,
    sendStop,
  ]);

  return (
    <CommandHistoryContext.Provider value={value}>
      {children}
    </CommandHistoryContext.Provider>
  );
}
