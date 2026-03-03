
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  getUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },
};

// Tickets API
export const ticketsAPI = {
  getAvailableTickets: async () => {
    const response = await api.get('/tickets');
    return response.data;
  },

  bookTickets: async (eventId, ticketCount) => {
    const response = await api.post('/book', { event_id: eventId, ticket_count: ticketCount });
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get('/user/bookings');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  getAllTickets: async () => {
    const response = await api.get('/admin/tickets');
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await api.get(`/admin/tickets/${id}`);
    return response.data;
  },

  getEventById: async (id) => {
    const response = await api.get(`/admin/events/${id}`);
    return response.data;
  },

  addEvent: async (eventData) => {
    const response = await api.post('/admin/tickets', eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },

  getAllLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },
};

export default api;
