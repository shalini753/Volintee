import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Opportunity API helpers
export const getOpportunity = async (id) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};

export const createOpportunity = async (data) => {
  // Check if data is FormData to set correct headers
  const config = data instanceof FormData 
    ? { headers: { 'Content-Type': 'multipart/form-data' } }
    : {};
    
  const response = await api.post('/opportunities', data, config);
  return response.data;
};

// Application APIs
export const createApplication = async (data) => {
  try {
    const response = await api.post('/applications', data);
    return { success: true, data: response.data.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to submit application' 
    };
  }
};

export const checkApplicationStatus = async (opportunityId) => {
  try {
    const response = await api.get(`/applications/me/opportunity/${opportunityId}`);
    return { success: true, ...response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to check application status' 
    };
  }
};

export const getMyApplications = async () => {
  try {
    const response = await api.get('/applications/my-applications');
    return { success: true, data: response.data.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch applications' 
    };
  }
};

export const getMyOpportunitiesWithStats = async () => {
  try {
    const response = await api.get('/opportunities/my-opportunities/stats');
    return { success: true, data: response.data.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch opportunities' 
    };
  }
};

export const getOpportunityApplications = async (opportunityId) => {
  try {
    const response = await api.get(`/applications/opportunity/${opportunityId}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch applications' 
    };
  }
};

export const updateApplicationStatus = async (applicationId, status, reviewNotes) => {
  try {
    const response = await api.put(`/applications/${applicationId}/status`, { status, reviewNotes });
    return { success: true, data: response.data.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update status' 
    };
  }
};

export default api;
