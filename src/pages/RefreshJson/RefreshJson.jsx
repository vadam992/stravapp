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
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          'https://www.strava.com/api/v3/athlete/activities',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { per_page: 200, page: 1 },
          }
        );

        setActivities(response.data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    fetchStoredActivities();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;

    // 3. Összehasonlítás: ha egy ID már létezik, kihagyjuk
    const existingIds = new Set(storedActivities.map(act => act.id));

    const newActivities = activities.filter(act => !existingIds.has(act.id));

    const updatedList = [...storedActivities, ...newActivities];
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

  const getDataFromStrava = () => {
    console.log(inputValue);
  };

  return (
    <div className="ac-list">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h2>Activity List</h2>
            <button onClick={downloadJSON}>Download JSON</button>
            <input
              type="number"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
            <button onClick={getDataFromStrava}>Get Data from Strava</button>
          </div>
        </div>
        <div className="row">
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
