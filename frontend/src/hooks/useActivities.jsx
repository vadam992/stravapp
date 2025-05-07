import { useState, useEffect, useRef } from 'react';
import { authenticateStrava, checkAuth } from '../api/api';
import { getAuthUrl } from '../auth/auth';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStravaData } from '../data/stravaSlice';

export const useActivities = (initialState = { visibleCount: 12 }) => {
  const [activities, setActivities] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [visibleCount, setVisibleCount] = useState(initialState.visibleCount);
  const fetched = useRef(false);
  const dispatch = useDispatch();
  const { data, status, error } = useSelector(state => state.strava);

  useEffect(() => {
    const loadActivities = async () => {
      if (fetched.current) return; // Just once allow API calling
      fetched.current = true;

      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');

      try {
        let token = null;
        const isToken = await checkAuth();

        if (!isToken && code) {
          token = await authenticateStrava(code);
        }

        if (isToken || token) {
          setIsAuthorized(true);
          if (status === 'idle') {
            dispatch(fetchStravaData());
          }
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Token exchange failed:', error);
      }
    };

    loadActivities();
  }, [status, dispatch]);

  // Amikor az adatok sikeresen megérkeznek, frissítsük az állapotot
  useEffect(() => {
    if (status === 'succeeded' && data) {
      setActivities(data);
      setFilteredActivities(data);
    }
  }, [status, data]);

  const handleFilters = (year, month) => {
    if (!year && !month) {
      setFilteredActivities(activities);
      return;
    }

    const filtered = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      const activityYear = activityDate.getFullYear();
      const activityMonth = activityDate.getMonth() + 1;

      return (
        (year ? activityYear === parseInt(year) : true) &&
        (month ? activityMonth === parseInt(month) : true)
      );
    });

    setFilteredActivities(filtered);
    setVisibleCount(initialState.visibleCount);
  };

  const handleAuth = () => {
    window.location.href = getAuthUrl();
  };

  return {
    activities,
    filteredActivities,
    handleFilters,
    handleAuth,
    isAuthorized,
    visibleCount,
    setVisibleCount,
    status,
    error,
  };
};
