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
