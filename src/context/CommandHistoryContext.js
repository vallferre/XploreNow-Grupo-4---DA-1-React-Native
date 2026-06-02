import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { executeAction, moveRobot, sitDown, standUp, stopRobot } from '../services/robotService';
import {
  loadLocalHistory,
  saveLocalCommand,
  shouldLogMove,
} from '../services/localHistoryStorage';
import { useAuth } from '../hooks/useAuth';

export const CommandHistoryContext = createContext(null);

export function CommandHistoryProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.identifier;

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const refreshTimeoutRef = useRef(null);
  const lastMoveLogAtRef = useRef(0);

  const refreshHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingHistory(true);
    setHistoryError('');

    try {
      if (!userId) {
        setHistory([]);
        return [];
      }

      const nextHistory = await loadLocalHistory(userId);
      setHistory(nextHistory);
      return nextHistory;
    } catch (error) {
      setHistoryError(error?.message || 'No se pudo cargar el historial local.');
      throw error;
    } finally {
      if (!silent) setLoadingHistory(false);
    }
  }, [userId]);

  const scheduleHistoryRefresh = useCallback((delayMs = 150) => {
    clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => {
      refreshHistory({ silent: true }).catch(() => {});
    }, delayMs);
  }, [refreshHistory]);

  useEffect(() => () => clearTimeout(refreshTimeoutRef.current), []);

  useEffect(() => {
    refreshHistory({ silent: true }).catch(() => {});
  }, [refreshHistory, userId]);

  const logMoveDebounced = useCallback(async (success, detail = '') => {
    if (!userId) return;

    const nextTimestamp = shouldLogMove(lastMoveLogAtRef.current);
    if (!nextTimestamp) return;

    lastMoveLogAtRef.current = nextTimestamp;
    await saveLocalCommand(userId, 'move', success, detail);
  }, [userId]);

  const executeTrackedCommand = useCallback(async (actionLabel, executor, options = {}) => {
    const {
      refresh = true,
      log = true,
      debounceMove = false,
      refreshDelayMs = 150,
    } = options;

    if (!userId) {
      return executor();
    }

    try {
      const result = await executor();

      if (log) {
        if (debounceMove) {
          await logMoveDebounced(true);
        } else {
          await saveLocalCommand(userId, actionLabel, true);
        }
      }
      if (refresh) {
        scheduleHistoryRefresh(refreshDelayMs);
      }

      return {
        action: actionLabel,
        result,
      };
    } catch (error) {
      const detail = error?.message || '';

      if (log) {
        if (debounceMove) {
          await logMoveDebounced(false, detail);
        } else {
          await saveLocalCommand(userId, actionLabel, false, detail);
        }
      }
      if (refresh) {
        scheduleHistoryRefresh(refreshDelayMs);
      }
      throw error;
    }
  }, [logMoveDebounced, scheduleHistoryRefresh, userId]);

  const sendMove = useCallback((vx, vy, vyaw) => (
    executeTrackedCommand('move', () => moveRobot(vx, vy, vyaw), {
      refresh: false,
      log: true,
      debounceMove: true,
    })
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
