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
