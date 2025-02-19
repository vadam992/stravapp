import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RefreshJsonPage = () => {
  const [activities, setActivities] = useState([]); // Friss adatok
  const [storedActivities, setStoredActivities] = useState([]); // Mentett JSON
  const [mergedActivities, setMergedActivities] = useState([]); // Egyesített adatok
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // 1. Korábban mentett JSON adatok betöltése
    const fetchStoredActivities = async () => {
      try {
        const response = await axios.get('./strava_activities.json');

        setStoredActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    // 2. API hívás Stravához
    const fetchActivities = async () => {
      let allActivities = [];
      let page = 1;
      let hasMoreData = true;
      const accessToken = localStorage.getItem('access_token');

      try {
        while (hasMoreData) {
          const response = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

          const data = await response.json();
          if (data.length === 0) {
            hasMoreData = false;
          } else {
            allActivities = [...allActivities, ...data];
            page++;
          }
        }

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    //fetchStoredActivities();
    //fetchActivities();
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;

    // 3. Összehasonlítás: ha egy ID már létezik, kihagyjuk
    const existingIds = new Set(storedActivities.map(act => act.id));

    const newActivities = activities.filter(act => !existingIds.has(act.id));

    const updatedList = [...newActivities, ...storedActivities];
    setMergedActivities(updatedList);

    // 4. Frissített adatokat elmentjük
    localStorage.setItem('saved_activities', JSON.stringify(updatedList));
  }, [activities, storedActivities]);

  // 5. JSON fájl letöltése
  const downloadJSON = () => {
    const jsonString = JSON.stringify(mergedActivities, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'updated_activities.json';
    link.click();

    URL.revokeObjectURL(url);
  };

  const getAuthUrl = () => {
    const clientId = process.env.REACT_APP_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_REDIRECT_URI;
    const scope = process.env.REACT_APP_SCOPE;

    return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const authToStrava = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const response = await authenticateStrava(code);
      alert(response.token);
    }
  };

  const authenticateStrava = async code => {
    const response = await fetch('http://localhost:5000/api/auth/strava', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    return response.json();
  };

  const getDataFromStrava = async () => {
    const response = await fetch('http://localhost:5000/api/strava/data', {
      method: 'GET',
      credentials: 'include',
    });

    console.log(response.json());
  };

  return (
    <div className="ac-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2>Activity List</h2>
            <button onClick={downloadJSON}>Download JSON</button>
            <button onClick={getDataFromStrava}>Get Data from Strava</button>
            <a href="https://www.strava.com/oauth/authorize?client_id=145447&redirect_uri=http://localhost:3000/refresh-data&response_type=code&scope=read,activity:read">
              Connect Strava
            </a>
            <button onClick={authToStrava}>Authenticate</button>
          </div>
        </div>
        <div className="row">
          {mergedActivities.length}
          <ul>
            {mergedActivities.map(activity => (
              <li key={activity.id}>
                <strong>{activity.name}</strong> -{' '}
                {new Date(activity.start_date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RefreshJsonPage;
