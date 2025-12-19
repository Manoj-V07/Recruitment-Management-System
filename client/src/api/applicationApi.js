import api from './axios';

export const applyForJob = async (jobId) => {
  const res = await api.post(`/application/apply/${jobId}`);
  return res.data;
};

export const getMyApplications = async () => {
  const res = await api.get('/application/my');
  return res.data;
};

export const getApplicationsForJob = async (jobId) => {
  const res = await api.get(`/application/job/${jobId}`);
  return res.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const res = await api.patch(`/application/status/${applicationId}`, { status });
  return res.data;
};
