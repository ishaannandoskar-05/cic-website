// In production, ALWAYS use the Render backend. Locally, use the Vite proxy.
const isProd = import.meta.env.PROD;

// Fallback to the known Render URL if the env var is missing/empty
const RENDER_BACKEND = 'https://cic-website.onrender.com';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || RENDER_BACKEND}/api`;
// Request helper that handles headers and returns responses
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  // Attach token if present
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not stringify if body is FormData (needed for file upload)
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API error (${response.status})`);
  }

  return data;
};

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),

    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: userData,
      }),

    getMe: () =>
      request('/auth/me', {
        method: 'GET',
      }),

    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PUT',
        body: profileData,
      }),
  },

  announcements: {
    getAll: () => request('/announcements'),
    create: (data) =>
      request('/announcements', {
        method: 'POST',
        body: data,
      }),
    update: (id, data) =>
      request(`/announcements/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id) =>
      request(`/announcements/${id}`, {
        method: 'DELETE',
      }),
  },

  events: {
    getAll: () => request('/events'),
    create: (data) =>
      request('/events', {
        method: 'POST',
        body: data,
      }),
    update: (id, data) =>
      request(`/events/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id) =>
      request(`/events/${id}`, {
        method: 'DELETE',
      }),
  },

  resources: {
    getAll: () => request('/resources'),
    create: (formData) =>
      request('/resources', {
        method: 'POST',
        body: formData,
      }),
    update: (id, formData) =>
      request(`/resources/${id}`, {
        method: 'PUT',
        body: formData,
      }),
    delete: (id) =>
      request(`/resources/${id}`, {
        method: 'DELETE',
      }),
  },

  gallery: {
    getAll: () => request('/gallery'),
    getStats: () => request('/gallery/stats'),
    create: (formData) =>
      request('/gallery', {
        method: 'POST',
        body: formData,
      }),
    update: (id, data) =>
      request(`/gallery/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id) =>
      request(`/gallery/${id}`, {
        method: 'DELETE',
      }),
  },

  quests: {
    getAll: () => request('/quests'),
    getDaily: () => request('/quests/daily'),
    create: (data) =>
      request('/quests', {
        method: 'POST',
        body: data,
      }),
    update: (id, data) =>
      request(`/quests/${id}`, {
        method: 'PUT',
        body: data,
      }),
    delete: (id) =>
      request(`/quests/${id}`, {
        method: 'DELETE',
      }),
  },

  submissions: {
    submit: (questId, codeData) =>
      request(`/submissions/${questId}/submit`, {
        method: 'POST',
        body: codeData,
      }),
    getMySubmissions: () => request('/submissions/my-submissions'),
    getAll: () => request('/submissions'),
    review: (id, reviewData) =>
      request(`/submissions/${id}/review`, {
        method: 'PUT',
        body: reviewData,
      }),
  },

  members: {
    getAll: () => request('/members'),
    delete: (id) =>
      request(`/members/${id}`, {
        method: 'DELETE',
      }),
    updateXp: (id, xp, mode = 'set') =>
      request(`/members/${id}/xp`, {
        method: 'PATCH',
        body: { xp, mode },
      }),
  },

  leaderboard: {
    get: () => request('/leaderboard'),
  },

  analytics: {
    getStudent: () => request('/analytics/student'),
    getAdmin: () => request('/analytics/admin'),
  },

  compiler: {
    execute: (language, code, testcases = [], questId) => request('/compiler/execute', {
      method: 'POST',
      body: {
        language,
        code,
        testcases,
        ...(questId ? { questId } : {}),
      },
    }),
    compile: (language, code) => request('/compiler/compile', {
      method: 'POST',
      body: { language, code },
    }),
    getTemplates: () => request('/compiler/templates'),
    getRuntimes: () => request('/compiler/runtimes'),
  },
};
