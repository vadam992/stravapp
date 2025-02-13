import React, { useState, useEffect } from "react";
import axios from "axios";
import GPXViewerMap from "../GPXViewerMap/GPXViewerMap.component";

const ActivityGPX = ({ activityId }) => {
  const [gpxData, setGpxData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivityStream = async () => {
      const accessToken = localStorage.getItem("access_token");

      if (!accessToken) {
        setError("Access token is missing. Please authorize the application.");
        return;
      }

      try {
        const response = await axios.get(
          `https://www.strava.com/api/v3/activities/${activityId}/streams`,
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
  }, [activityId]); // Csak akkor fut újra, ha az `activityId` változik

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

  // GPX letöltése
  const downloadGPX = () => {
    if (!gpxData) return;

    const blob = new Blob([gpxData], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `activity_${activityId}.gpx`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="contianer">
      <div className="gpx_map">
        {/* <GPXViewerMap gpxUrl={ gpxData } /> */}
      </div>
      {error && <p>Error: {error}</p>}
      {gpxData ? (
        <div>
          <div className="gpx_map">
            <GPXViewerMap gpxUrl={ gpxData } />
          </div>
          <p>GPX data fetched successfully.</p>
          <button onClick={downloadGPX}>Download GPX File</button>
        </div>
      ) : (
        <p>Loading GPX data...</p>
      )}
    </div>
  );
};

export default ActivityGPX;
