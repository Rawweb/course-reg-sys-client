import api from './axios';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};
