import api from './authService';

export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const connectRobot = async (robotType) => {
  const response = await api.post('/connect', {
    robot_type: robotType,
  });
  return response.data;
};

export const disconnectRobot = async () => {
  const response = await api.post('/disconnect');
  return response.data;
};

export const moveRobot = async (vx, vy, vyaw) => {
  const response = await api.post('/move', { vx, vy, vyaw });
  return response.data;
};

export const stopRobot = async () => {
  const response = await api.post('/stop');
  return response.data;
};

export const standUp = async () => {
  const response = await api.post('/standup');
  return response.data;
};

export const sitDown = async () => {
  const response = await api.post('/sitdown');
  return response.data;
};

export const getAvailableActions = async () => {
  const response = await api.get('/actions');
  return response.data;
};

export const executeAction = async (actionName) => {
  const response = await api.post(`/action/${actionName}`);
  return response.data;
};

export const dampRobot = async () => {
  const response = await api.post('/damp');
  return response.data;
};

/** Modos Go2 con body { enable }. Por defecto activa el modo. */
export const setRobotMode = async (mode, enable = true) => {
  const response = await api.post(`/${mode}`, { enable });
  return response.data;
};
