import api from './axios';

// Optional filters: { department, level, semester }
export const getCourses = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await api.get(`/courses${params ? `?${params}` : ''}`);
  return data.data;
};

export const createCourse = async (payload) => {
  const { data } = await api.post('/courses', payload);
  return data;
};

export const updateCourse = async ({ id, ...payload }) => {
  const { data } = await api.put(`/courses/${id}`, payload);
  return data;
};

export const deactivateCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};
