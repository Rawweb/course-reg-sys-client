import api from './axios';

export const getStudentResults = async (studentId) => {
  const { data } = await api.get(`/results/student/${studentId}`);
  return data.data;
};

export const addBulkResults = async (results) => {
  const { data } = await api.post('/results/bulk', { results });
  return data;
};
