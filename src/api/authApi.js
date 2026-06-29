import api from './axios';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const changePassword = async (payload) => {
  const { data } = await api.put('/auth/change-password', payload);
  return data;
};