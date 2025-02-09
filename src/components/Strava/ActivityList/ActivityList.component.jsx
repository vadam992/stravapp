import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { fetchActivities } from '../../../api/api';
import {
  getAuthUrl,
  isAuthorized,
  getStoredToken,
  isTokenExpired,
  refreshToken,
  getToken,
  saveToken,
} from '../../../auth/auth';

import Connect from '../Connection/Connect.component';
import '../../../sass/ActivityList.scss';
import '../../../sass/Common.css';
import SearchBox from '../../SearchBox/SearchBox.component';

const ActivityList = () => {
  const [activities, setActivities] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]); // Szűrt aktivitások
  const [filters, setFilters] = useState({ year: '', month: '' });

  useEffect(() => {
    const loadActivities = async () => {
      let token = getStoredToken();
      const query = new URLSearchParams(window.location.search);
      const code = query.get('code');

      try {
        if (code && (token == null || isTokenExpired())) {
          const { access_token, refresh_token, expires_at } =
            await getToken(code);
          saveToken(access_token, refresh_token, expires_at);
          token = access_token;
        } else {
          const refreshTokenData = await refreshToken();
          saveToken(
            refreshTokenData.access_token,
            refreshTokenData.refresh_token,
            refreshTokenData.expires_at
          );

          token = refreshTokenData.access_token;
        }

        // }
        console.log('token: ', token);
        const data = await fetchActivities(token);
        setActivities(data);
        setFilteredActivities(data);
      } catch (error) {
        console.error('Token exchange failed:', error);
      }
    };

    loadActivities();
  }, []);

  //Szűrés évre és hónapra
  const handleFilters = (year, month) => {
    setFilters({ year, month });

    if (!year && !month) {
      setFilteredActivities(activities); // Ha nincs szűrő, mutassa az összeset
      return;
    }

    const filtered = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      const activityYear = activityDate.getFullYear();
      const activityMonth = activityDate.getMonth() + 1; // 0-indexelt

      const isYearMatch = year ? activityYear === parseInt(year) : true;
      const isMonthMatch = month ? activityMonth === parseInt(month) : true;

      return isYearMatch && isMonthMatch;
    });

    setFilteredActivities(filtered);
  };

  // JSON fájl generálása és letöltése
  const downloadJSON = () => {
    const jsonString = JSON.stringify(filteredActivities, null, 2); // Szépített JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Link létrehozása és kattintás triggerelése
    const link = document.createElement('a');
    link.href = url;
    link.download = 'strava_activities.json';
    link.click();

    // Blob URL felszabadítása
    URL.revokeObjectURL(url);
  };

  // Engedélyezési URL generálása
  const handleAuth = () => {
    window.location.href = getAuthUrl();
  };

  if (!isAuthorized()) {
    return <Connect handleAuth={handleAuth} />;
  }

  if (!activities) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="ac-list">
      <div className="container">
        <SearchBox onApplyFilters={handleFilters} />
        <div className="row">
          {filteredActivities.map(activity => (
            <div
              className="col-12 col-xl-4 .col-md-6 col-sm-6"
              key={activity.id}
            >
              <div className="ac-list__card">
                <div className="ac-list__title">{activity.name}</div>
                <div className="ac-list__date">
                  {new Date(activity.start_date).toLocaleDateString()}
                </div>
                <div>{(activity.distance / 1000).toFixed(2)} km</div>
                <div>{(activity.moving_time / 60).toFixed(2)} minutes</div>
                <div className="ac-list__button">
                  <Link to={`/activity/${activity.id}`}>Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={downloadJSON}>Download Activities as JSON</button>
    </div>
  );
};

export default ActivityList;
