import api from './axios';

// Optional filters: { role, department, level }
export const getUsers = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/users${params ? `?${params}` : ''}`);
  return data.data;
};

export const toggleUserStatus = async (id) => {
  const { data } = await api.put(`/users/${id}/toggle-status`);
  return data;
};

export const promoteStudent = async (id) => {
  const { data } = await api.put(`/users/${id}/promote`);
  return data;
};

export const bulkPromoteStudents = async (payload) => {
  const { data } = await api.put('/users/bulk-promote', payload);
  return data;
};
