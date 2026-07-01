import api from './axios';

export const loginRequest = async (identifier, password) => {
  const { data } = await api.post('/auth/login', { identifier, password });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const changePasswordRequest = async (currentPassword, newPassword) => {
  const { data } = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
};
