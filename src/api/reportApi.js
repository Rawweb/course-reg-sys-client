import api from './axios';

export const getStudentRegistrationReport = async () => {
  const { data } = await api.get('/reports/student-registration');
  return data;
};

export const getCourseEnrollmentReport = async () => {
  const { data } = await api.get('/reports/course-enrollment');
  return data;
};

export const getPrerequisiteValidationReport = async () => {
  const { data } = await api.get('/reports/prerequisite-validation');
  return data;
};

export const getUnitLoadReport = async () => {
  const { data } = await api.get('/reports/unit-load');
  return data;
};
