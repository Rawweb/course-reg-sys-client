import api from './axios';

export const getPendingRegistrations = async () => {
  const { data } = await api.get('/registrations/pending');
  return data;
};

export const reviewRegistration = async (id, decision, feedback) => {
  const { data } = await api.put(`/registrations/${id}/review`, {
    decision,
    feedback,
  });
  return data;
};
