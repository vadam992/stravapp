import axios from 'axios';

const API_BASE_URL = 'https://www.strava.com/api/v3';

export const fetchActivities = async token => {
  try {
    const response = await axios.get(`${API_BASE_URL}/athlete/activities`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 200, page: 1 },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const authenticateStrava = async code => {
  const response = await fetch('http://localhost:5000/api/auth/strava', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  return response.json();
};

export const getDataFromStrava = async () => {
  const response = await fetch('http://localhost:5000/api/strava/data', {
    method: 'GET',
    credentials: 'include',
  });

  return response.json();
};
