import { useContext } from 'react';
import { RobotConnectionContext } from '../context/RobotConnectionContext';

export function useRobotConnection() {
  const ctx = useContext(RobotConnectionContext);
  if (!ctx) {
    throw new Error('useRobotConnection debe usarse dentro de <RobotConnectionProvider>');
  }
  return ctx;
}
