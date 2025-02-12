import axios from 'axios';

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/token';

export const getToken = async code => {
  try {
    const response = await axios.post(STRAVA_AUTH_URL, {
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging token:', error);
    throw error;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export const saveToken = (accessToken, refreshToken, expiresAt) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('expires_at', expiresAt);
};

export const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expires_at');
  if (!expiresAt) return true; //If not expire time
  return Math.floor(Date.now() / 1000) >= expiresAt;
};

export const getAuthUrl = () => {
  const clientId = process.env.REACT_APP_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_REDIRECT_URI;
  const scope = process.env.REACT_APP_SCOPE;

  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
};

export const isAuthorized = () => {
  const token = localStorage.getItem('access_token');
  return !!token; // Ha van token, akkor true
};

export const refreshToken = async () => {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.REACT_APP_CLIENT_ID,
      client_secret: process.env.REACT_APP_CLIENT_SECRET,
      refresh_token: getRefreshToken(),
      grant_type: 'refresh_token',
    });

    return response.data; // Visszaadja az új tokeneket
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};
