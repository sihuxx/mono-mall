const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('mono_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || '요청에 실패했습니다');
  }

  return data;
};

export const api = {
  // Auth
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: (productId) => request(`/comments/product/${productId}`),
  createComment: (data) => request('/comments', { method: 'POST', body: JSON.stringify(data) }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  // Likes
  getProductLikes: (productId) => request(`/likes/product/${productId}`),
  toggleLike: (productId) => request(`/likes/toggle/${productId}`, { method: 'POST' }),
  getMyLikes: () => request('/likes/me'),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (data) => request('/cart/add', { method: 'POST', body: JSON.stringify(data) }),
  updateCart: (data) => request('/cart/update', { method: 'PATCH', body: JSON.stringify(data) }),
  removeFromCart: (productId) => request(`/cart/item/${productId}`, { method: 'DELETE' }),
};

export const setToken = (token) => localStorage.setItem('mono_token', token);
export const clearToken = () => localStorage.removeItem('mono_token');
