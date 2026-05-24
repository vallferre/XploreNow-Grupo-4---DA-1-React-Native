export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email.trim()) errors.email = 'El email es requerido';
  else if (!isValidEmail(email)) errors.email = 'Email inválido';
  if (!password) errors.password = 'La contraseña es requerida';
  return errors;
};

export const validateRegisterForm = ({ username, email, password, confirmPassword }) => {
  const errors = {};
  if (!username.trim()) errors.username = 'El nombre de usuario es requerido';
  else if (username.trim().length < 3) errors.username = 'Mínimo 3 caracteres';
  if (!email.trim()) errors.email = 'El email es requerido';
  else if (!isValidEmail(email)) errors.email = 'Email inválido';
  if (!password) errors.password = 'La contraseña es requerida';
  else if (password.length < 6) errors.password = 'Mínimo 6 caracteres';
  if (!confirmPassword) errors.confirmPassword = 'Confirmá tu contraseña';
  else if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
  return errors;
};
