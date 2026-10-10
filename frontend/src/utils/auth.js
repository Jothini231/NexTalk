const TOKEN_KEY = 'chatToken';
const USER_KEY = 'chatUser';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user) => localStorage.setItem(USER_KEY, JSON.stringify(user));

export const removeUser = () => localStorage.removeItem(USER_KEY);

export const isAuthenticated = () => !!getToken();

export const clearAuth = () => {
  removeToken();
  removeUser();
};
