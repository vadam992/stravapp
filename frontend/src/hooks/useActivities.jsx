import { useState, useEffect, useRef } from 'react';
import { authenticateStrava, getDataFromStrava } from '../api/api';
import { getAuthUrl } from '../auth/auth';

export const useActivities = (initialState = { visibleCount: 12 }) => {
  const [activities, setActivities] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [visibleCount, setVisibleCount] = useState(initialState.visibleCount);
  const fetched = useRef(false);

  useEffect(() => {
    const loadActivities = async () => {
      if (fetched.current) return; //Just once allow API calling
      fetched.current = true;

      let token = null;
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');

      try {
        if (code != null) {
          token = await authenticateStrava(code);
          if (token) {
            setIsAuthorized(true);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
            const data = await getDataFromStrava();
            setActivities(data);
            setFilteredActivities(data);
          }
        }
      } catch (error) {
        console.error('Token exchange failed:', error);
      }
    };

    loadActivities();
  }, []);

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
  };
};
