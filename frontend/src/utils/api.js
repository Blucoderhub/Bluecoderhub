const TOKEN_KEY = 'bluecoderhub_auth_token';

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export const api = {
  login: (email, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  me: () => request('/api/auth/me'),
  listBlogs: () => request('/api/blogs'),
  listAdminBlogs: () => request('/api/blogs/admin'),
  getBlog: (idOrSlug) => request(`/api/blogs/${encodeURIComponent(idOrSlug)}`),
  createBlog: (payload) => request('/api/blogs', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateBlog: (id, payload) => request(`/api/blogs/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteBlog: (id) => request(`/api/blogs/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  }),
  createApplication: (payload) => request('/api/applications', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  listApplications: () => request('/api/applications'),
  updateApplicationStatus: (id, status) => request(`/api/applications/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  subscribe: (email, source = 'footer') => request('/api/subscribers', {
    method: 'POST',
    body: JSON.stringify({ email, source })
  }),
  listSubscribers: () => request('/api/subscribers'),
  deleteSubscriber: (id) => request(`/api/subscribers/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
};
