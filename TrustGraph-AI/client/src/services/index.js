import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

export const analysisService = {
  createAnalysis: async (data) => {
    const response = await api.post('/analysis', data);
    return response.data;
  },
  getAnalyses: async () => {
    const response = await api.get('/analysis');
    return response.data;
  },
  getAnalysisById: async (id) => {
    const response = await api.get(`/analysis/${id}`);
    return response.data;
  },
  saveAnalysis: async (id) => {
    const response = await api.put(`/analysis/${id}/save`);
    return response.data;
  },
  deleteAnalysis: async (id) => {
    const response = await api.delete(`/analysis/${id}`);
    return response.data;
  },
};

export const recruiterService = {
  verifyRecruiter: async (data) => {
    const response = await api.post('/recruiters/verify', data);
    return response.data;
  },
  reVerify: async (id) => {
    const response = await api.post(`/recruiters/${id}/re-verify`);
    return response.data;
  },
  getRecruiters: async () => {
    const response = await api.get('/recruiters');
    return response.data;
  },
  getUserRecruiters: async () => {
    const response = await api.get('/recruiters/user/my-recruiters');
    return response.data;
  },
  getRecruiterById: async (id) => {
    const response = await api.get(`/recruiters/${id}`);
    return response.data;
  },
};

export const reportService = {
  createReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  getReports: async (params) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },
  getReportById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  getUserReports: async () => {
    const response = await api.get('/reports/user/my-reports');
    return response.data;
  },
  verifyReport: async (id) => {
    const response = await api.put(`/reports/${id}/verify`);
    return response.data;
  },
};

export const offerLetterService = {
  analyzeOfferLetter: async (data) => {
    const response = await api.post('/offer-letters', data);
    return response.data;
  },
  getOfferLetters: async () => {
    const response = await api.get('/offer-letters');
    return response.data;
  },
  getOfferLetterById: async (id) => {
    const response = await api.get(`/offer-letters/${id}`);
    return response.data;
  },
};

export const aiService = {
  getStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },
  runAnalysis: async (analysisId, language = 'en') => {
    const response = await api.post(`/ai/analyze/${analysisId}`, { language });
    return response.data;
  },
  explain: async (analysisId, question, language = 'en') => {
    const response = await api.post(`/ai/explain/${analysisId}`, { question, language });
    return response.data;
  },
  detectLanguage: async (content) => {
    const response = await api.post('/ai/detect-language', { content });
    return response.data;
  },
};

export const trustyService = {
  chat: async (message, history = [], analysisId = null, context = null) => {
    const response = await api.post('/trusty/chat', { message, history, analysisId, context });
    return response.data;
  },
  getProactiveSuggestion: async (page, analysisId = null) => {
    const response = await api.get('/trusty/proactive', { params: { page, analysisId } });
    return response.data;
  },
};

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  getReports: async (params) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },
  updateReportStatus: async (id, status) => {
    const response = await api.put(`/admin/reports/${id}`, { status });
    return response.data;
  },
  getRecruiters: async (params) => {
    const response = await api.get('/admin/recruiters', { params });
    return response.data;
  },
  getCompanies: async (params) => {
    const response = await api.get('/admin/companies', { params });
    return response.data;
  },
};
