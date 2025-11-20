import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  signUp: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/signup', data),
  signIn: (data: { email: string; password: string }) => api.post('/auth/signin', data),
  getMe: () => api.get('/auth/me'),
};

// Business API
export const businessApi = {
  create: (data: any) => api.post('/business', data),
  update: (id: string, data: any) => api.patch(`/business/${id}`, data),
  getById: (id: string) => api.get(`/business/${id}`),
  getAll: () => api.get('/business'),
};

// Lead API
export const leadApi = {
  create: (businessId: string, data: any) =>
    api.post(`/leads?businessId=${businessId}`, data),
  update: (id: string, data: any) => api.patch(`/leads/${id}`, data),
  getAll: (businessId: string, filters?: any) =>
    api.get(`/leads?businessId=${businessId}`, { params: filters }),
  getById: (id: string) => api.get(`/leads/${id}`),
  delete: (id: string) => api.delete(`/leads/${id}`),
};

// Invoice API
export const invoiceApi = {
  create: (businessId: string, data: any) =>
    api.post(`/invoices?businessId=${businessId}`, data),
  getAll: (businessId: string, filters?: any) =>
    api.get(`/invoices?businessId=${businessId}`, { params: filters }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/invoices/${id}/status`, data),
  createPaymentLink: (id: string) => api.post(`/invoices/${id}/payment-link`),
  sendWhatsApp: (id: string) => api.post(`/invoices/${id}/send-whatsapp`),
};

// Booking API
export const bookingApi = {
  create: (businessId: string, data: any) =>
    api.post(`/bookings?businessId=${businessId}`, data),
  getAll: (businessId: string, filters?: any) =>
    api.get(`/bookings?businessId=${businessId}`, { params: filters }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  getSlots: (businessId: string, date: string) =>
    api.get(`/bookings/slots?businessId=${businessId}&date=${date}`),
  update: (id: string, data: any) => api.patch(`/bookings/${id}`, data),
};

// WhatsApp API
export const whatsappApi = {
  sendMessage: (businessId: string, data: any) =>
    api.post(`/whatsapp/send?businessId=${businessId}`, data),
  getMessages: (businessId: string, filters?: any) =>
    api.get(`/whatsapp/messages?businessId=${businessId}`, { params: filters }),
  getById: (id: string) => api.get(`/whatsapp/messages/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: (businessId: string) => api.get(`/dashboard/stats?businessId=${businessId}`),
  getActivity: (businessId: string) => api.get(`/dashboard/activity?businessId=${businessId}`),
};
