import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import ActivityGPX from '../ActivityGPX/ActivityGPX.component';
import '../../../styles/ActivityDetail.scss';
import ActivityElevation from "../ActivityElevation/ActivityElevation";

const ActivityDetails = () => {
  const { id } = useParams(); // Az aktivitás ID-ja az URL-ből
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [gpxData, setGpxData] = useState(null);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setError("Access token is missing. Please authorize the application.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://www.strava.com/api/v3/activities/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setActivity(response.data);
      } catch (err) {
        setError("Failed to fetch activity details.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [id]);

  useEffect(() => {
    const fetchActivityStream = async () => {
      if (!activity) return; // Csak akkor hívjuk le, ha van aktivitás adat
      
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setError("Access token is missing. Please authorize the application.");
        return;
      }

      try {
        const response = await axios.get(
          `https://www.strava.com/api/v3/activities/${activity.id}/streams`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              keys: "latlng,time,altitude",
              key_by_type: true,
            },
          }
        );

        const { latlng, time, altitude } = response.data;

        if (!latlng || !latlng.data) {
          setError("No GPS data available for this activity.");
          return;
        }

        const gpx = generateGPX(latlng.data, time?.data, altitude?.data);
        setGpxData(gpx);
      } catch (err) {
        setError("Failed to fetch activity stream.");
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
      const time = timeData ? new Date(timeData[index] * 1000).toISOString() : null;
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

  if (loading) return <div>Loading activity details...</div>;
  if (error) return <div>Error: {error}</div>;
console.log(activity)
  return (
    <div className="activity_detail">
      <div className="container">
        <div className="row">
          <div className="col-6">
            <h1>{activity.name}</h1>
            <button onClick={() => navigate(-1)}>Back to List</button>
            <p>Date: {new Date(activity.start_date).toLocaleDateString()}</p>
            <p>Distance: {(activity.distance / 1000).toFixed(2)} km</p>
            <p>Time: {(activity.moving_time / 60).toFixed(2)} minutes</p>
            <p>Elevation Gain: {activity.total_elevation_gain} m</p>
            <p>Type: {activity.type}</p>
          </div>
          <div className="col-6">
            <div>{<ActivityGPX activityId={activity.id} />}</div>
          </div>
          <div className="col-12">
            <ActivityElevation gpxUrl={ gpxData } />
          </div>
        </div>
      </div>
      
      
    </div>
  );
};

export default ActivityDetails;