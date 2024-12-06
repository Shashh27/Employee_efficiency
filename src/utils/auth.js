import { jwtDecode } from 'jwt-decode';

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
};

export const verifyToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      clearAuth();
      return false;
    }
    
    return decoded;
  } catch (error) {
    clearAuth();
    return false;
  }
}