import api from './axios';

export const getAvailableCourses = async (semester) => {
  const { data } = await api.get(`/courses/available?semester=${semester}`);
  return data;
};

export const submitRegistration = async (courseCodes, semester) => {
  const { data } = await api.post('/courses/register', { courseCodes, semester });
  return data;
};

export const getMyRegistrations = async () => {
  const { data } = await api.get('/courses/my-registrations');
  return data;
};

export const getMyResults = async () => {
  const { data } = await api.get('/courses/my-results');
  return data;
};
