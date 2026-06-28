const STORAGE_KEYS = {
  token: 'accessToken',
  role: 'role',
  email: 'email',
};

export function getAuthState() {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  return {
    isAuthenticated: Boolean(token),
    role: localStorage.getItem(STORAGE_KEYS.role) || null,
    email: localStorage.getItem(STORAGE_KEYS.email) || null,
  };
}

export function setAuthState({ accessToken, role, email }) {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.token, accessToken);
  }
  if (role) {
    localStorage.setItem(STORAGE_KEYS.role, role);
  }
  if (email) {
    localStorage.setItem(STORAGE_KEYS.email, email);
  }
}

export function clearAuthState() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.role);
  localStorage.removeItem(STORAGE_KEYS.email);
}
