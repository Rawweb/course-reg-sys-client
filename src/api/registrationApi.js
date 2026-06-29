import api from './axios';

// Fetch available courses for the logged-in student
// carryover: boolean — when true, includes carryover courses in the response
export const getAvailableCourses = async (carryover = false) => {
  const { data } = await api.get(
    `/registrations/available-courses${carryover ? '?carryover=true' : ''}`,
  );
  return data.data;
};

// Submit a registration (create or update the student's pending registration)
export const createRegistration = async (payload) => {
  const { data } = await api.post('/registrations', payload);
  return data;
};

// Get the logged-in student's own registration(s)
export const getMyRegistrations = async () => {
  const { data } = await api.get('/registrations/my');
  return data.data;
};

// Submit a pending registration for lecturer approval
export const submitRegistration = async (registrationId) => {
  const { data } = await api.put(`/registrations/${registrationId}/submit`);
  return data;
};

// Get all registrations (lecturer/admin), optionally filtered by status
export const getAllRegistrations = async (status) => {
  const { data } = await api.get(`/registrations${status ? `?status=${status}` : ""}`)
  return data.data
}

// Approve or reject a registration
export const reviewRegistration = async ({ registrationId, action, comment }) => {
  const { data } = await api.put(`/registrations/${registrationId}/review`, { action, comment })
  return data
}
