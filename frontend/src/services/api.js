import axios from 'axios';

// Create API instance
const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const doctorAPI = {
  getAll: (params) => API.get('/doctors', { params }),
  getById: (id) => API.get(`/doctors/${id}`),
  addReview: (appointmentId, data) => API.post(`/doctors/review/${appointmentId}`, data),
};

export const appointmentAPI = {
  book: (data) => API.post('/appointments', data),
  getPatientAppointments: () => API.get('/appointments/patient'),
  getDoctorAppointments: () => API.get('/appointments/doctor'),
  updateStatus: (id, status) => API.put(`/appointments/${id}/status`, { status }),
  payAppointment: (id) =>
  API.put(`/appointments/${id}/pay`),
  shareMeetingLink: (id, meetingLink) =>
  API.put(`/appointments/${id}/meeting-link`, {
    meetingLink,
  }),
  complete: (id, doctorNotes) => API.put(`/appointments/${id}/complete`, { doctorNotes }),
};

export const aiAPI = {
  checkSymptoms: (symptoms) => API.post('/ai/symptom-check', { symptoms }),
  chatbot: (history, message) => API.post('/ai/chatbot', { history, message }),
};

export const adminAPI = {
  getAnalytics: () => API.get('/admin/analytics'),
  getDoctors: () => API.get('/admin/doctors'),
  verifyDoctor: (id) => API.put(`/admin/doctors/${id}/verify`),
};

export const supportAPI = {
  createTicket: (data) => API.post("/support", data),
  getMyTickets: () => API.get("/support/my"),
  getAllTickets: () => API.get("/support"),
  reply: (id, adminReply) =>
    API.put(`/support/${id}/reply`, { adminReply }),
};

export const messageAPI = {
  getMessages: (appointmentId) => API.get(`/messages/appointment/${appointmentId}`),
};

export default API;
