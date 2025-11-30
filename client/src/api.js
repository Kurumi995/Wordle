const API_BASE = 'http://localhost:6790';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const authAPI = {
  register: async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Registration failed');
    return response;
  },

  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('username', data.username);
    return data;
  },

  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  },

  getCurrentUser: () => {
    return {
      id: localStorage.getItem('userId'),
      username: localStorage.getItem('username'),
      jwt: localStorage.getItem('jwt')
    };
  }
};

export const userAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE}/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  }
};

export const roomAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/rooms`);
    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE}/rooms/${id}`);
    if (!response.ok) throw new Error('Failed to fetch room');
    return response.json();
  },

  create: async (roomData) => {
    const response = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(roomData)
    });
    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  },

  update: async (id, roomData) => {
    const response = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(roomData)
    });
    if (!response.ok) throw new Error('Failed to update room');
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete room');
    return response.json();
  },

  verifyPassword: async (id, password) => {
    const response = await fetch(`${API_BASE}/rooms/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (!response.ok) throw new Error('Failed to verify password');
    return response.json();
  },

  submitGuess: async (id, guess) => {
    const response = await fetch(`${API_BASE}/rooms/${id}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guess })
    });
    if (!response.ok) throw new Error('Failed to submit guess');
    return response.json();
  }
};

