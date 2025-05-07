import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getActivityDetails, getActivityStream } from '../../../api/api';

import ActivityGPX from '../ActivityGPX/ActivityGPX.component';
import '../../../styles/ActivityDetail.scss';
import ActivityElevation from '../ActivityElevation/ActivityElevation';

const ActivityDetails = () => {
  const { id } = useParams(); // Az aktivitás ID-ja az URL-ből
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [gpxData, setGpxData] = useState(null);
  const fetched = useRef(false);

  useEffect(() => {
    const activityDetails = async () => {
      try {
        const response = await getActivityDetails(id);

        setActivity(response);
      } catch (err) {
        setError('Failed to fetch activity details.');
      }
    };

    activityDetails();
  }, [id]);

  useEffect(() => {
    const fetchActivityStream = async () => {
      if (!activity) return; // Csak akkor hívjuk le, ha van aktivitás adat

      try {
        const response = await getActivityStream(id);
        const { latlng, time, altitude } = response;

        if (!latlng || !latlng.data) {
          setError('No GPS data available for this activity.');
          return;
        }

        const gpx = generateGPX(latlng.data, time?.data, altitude?.data);
        setGpxData(gpx);
      } catch (err) {
        setError('Failed to fetch activity stream.');
      }
    };

    fetchActivityStream(); // Automatikusan lehívás komponens betöltésekor
  }, [activity]); // Csak akkor fut újra, ha az `activityId` változik

  // GPX generálása
  const generateGPX = (latlngData, timeData, altitudeData) => {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    gpx += `<gpx version="1.1" creator="Strava" xmlns="http://www.topografix.com/GPX/1/1">\n`;
    gpx += `<trk>\n<trkseg>\n`;

    latlngData.forEach((point, index) => {
      const [lat, lng] = point;
      const time = timeData
        ? new Date(timeData[index] * 1000).toISOString()
        : null;
      const ele = altitudeData ? altitudeData[index] : null;

      gpx += `<trkpt lat="${lat}" lon="${lng}">\n`;
      if (ele !== null) {
        gpx += `<ele>${ele}</ele>\n`;
      }
      if (time) {
        gpx += `<time>${time}</time>\n`;
      }
      gpx += `</trkpt>\n`;
    });

    gpx += `</trkseg>\n</trk>\n</gpx>\n`;

    return gpx;
  };

  const msToKmh = mps => (mps * 3.6).toFixed(1);

  const convertSeconds = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}:${minutes}:${remainingSeconds}`;
  };

  if (!activity) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="activity_detail">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <button className="button yellow" onClick={() => navigate(-1)}>
              Back to List
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <h1>{activity.name}</h1>
            <p>Date: {new Date(activity.start_date).toLocaleDateString()}</p>
            <p>Distance: {(activity.distance / 1000).toFixed(2)} km</p>
            <p>Time: {(activity.moving_time / 60).toFixed(2)} minutes</p>
            <p>Elevation Gain: {activity.total_elevation_gain} m</p>
            <p>Average Speed: {msToKmh(activity.average_speed)} km/h</p>
            <p>Calories: {activity.calories}</p>
            <p>Avg Temp: {activity.average_temp} °C</p>
            <p>Elevtion high: {activity.elev_high}</p>
            <p>Elevtion low: {activity.elev_low}</p>
            <p>Max Speed: {msToKmh(activity.max_speed)} km/h</p>
            <p>Moving Time: {convertSeconds(activity.moving_time)}</p>
          </div>
          <div className="col-6">
            <div>{<ActivityGPX activityId={activity.id} />}</div>
          </div>
          <div className="col-12">
            <ActivityElevation gpxUrl={gpxData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetails;
