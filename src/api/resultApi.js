import api from './axios';

export const getStudentResults = async (studentId) => {
  const { data } = await api.get(`/results/student/${studentId}`);
  return data.data;
};

export const addBulkResults = async (results) => {
  const { data } = await api.post('/results/bulk', { results });
  return data;
};

export const getMyResults = async () => {
  const { data } = await api.get('/results/my');
  return data.data;
};

export const getGradeableCourses = async (studentId) => {
  const { data } = await api.get(`/results/gradeable/${studentId}`);
  return data.data;
};