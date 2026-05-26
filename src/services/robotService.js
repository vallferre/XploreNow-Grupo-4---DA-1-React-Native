import api from './authService';

export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const connectRobot = async (robotType, networkInterface) => {
  const response = await api.post('/connect', {
    robot_type: robotType,
    network_interface: networkInterface,
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
