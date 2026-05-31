import { useContext } from 'react';
import { CommandHistoryContext } from '../context/CommandHistoryContext';

export function useCommandHistory() {
  const ctx = useContext(CommandHistoryContext);
  if (!ctx) {
    throw new Error('useCommandHistory debe usarse dentro de <CommandHistoryProvider>');
  }
  return ctx;
}
