/**
 * Centralized API client for all backend calls.
 * Handles JWT injection, standardized responses, and error handling.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('navaved_token');

  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || data.error || `Request failed (${res.status})`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to server. It may be waking up — please try again in a moment.');
    }
    throw err;
  }
}

const API = {
  // ── Public ──
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProductBySlug: (slug) => request(`/api/products/${slug}`),

  getStores: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/stores${qs ? `?${qs}` : ''}`);
  },

  // ── Auth ──
  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request('/api/auth/me'),

  // ── Admin Products ──
  getAdminProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },
  createProduct: (data) =>
    request('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id, data) =>
    request(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleProductStatus: (id) =>
    request(`/api/admin/products/${id}/status`, { method: 'PATCH' }),

  // ── Admin Stores ──
  getAdminStores: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/stores${qs ? `?${qs}` : ''}`);
  },
  createStore: (data) =>
    request('/api/admin/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateStore: (id, data) =>
    request(`/api/admin/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleStoreStatus: (id) =>
    request(`/api/admin/stores/${id}/status`, { method: 'PATCH' }),

  // ── Image Upload ──
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
  },
};

export default API;
