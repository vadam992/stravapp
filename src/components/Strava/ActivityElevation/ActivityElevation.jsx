import React, { useEffect, useMemo, useRef } from "react";
import "leaflet-gpx";
import gpxParser from "gpxparser";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ActivityElevation = (props) => {
  const mapRef = useRef();

  // A GPX objektumot csak akkor hozzuk létre, ha a props.gpxUrl változik
  const gpxData = useMemo(() => {
    if (!props.gpxUrl) return null;

    const gpx = new gpxParser();
    gpx.parse(props.gpxUrl);
    return gpx;
  }, [props.gpxUrl]);

  // A pozíciókat csak akkor generáljuk újra, ha a gpxData változik
  const positions = useMemo(() => {
    if (!gpxData || !gpxData.tracks.length) return [];
    return gpxData.tracks[0].points.map((p) => [p.lat, p.lon]);
  }, [gpxData]);

  const chartData = useMemo(() => {
    if (!gpxData || !gpxData.tracks || gpxData.tracks.length === 0) return [];
  
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371e3; // Föld sugara méterben
      const toRadians = (deg) => (deg * Math.PI) / 180;
      const φ1 = toRadians(lat1);
      const φ2 = toRadians(lat2);
      const Δφ = toRadians(lat2 - lat1);
      const Δλ = toRadians(lon2 - lon1);
  
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
      return R * c; // Távolság méterben
    };
  
    let cumulativeDistance = 0; // Kezdő kumulatív távolság
    return gpxData.tracks[0].points.map((p, index, points) => {
      if (index > 0) {
        const prevPoint = points[index - 1];
        const distance = calculateDistance(
          prevPoint.lat,
          prevPoint.lon,
          p.lat,
          p.lon
        );
        cumulativeDistance += distance;
      }
  
      return {
        distance: (cumulativeDistance / 1000).toFixed(2), // Távolság km-ben
        elevation: p.ele, // Magasság
        lat: p.lat,
        lon: p.lon,
      };
    });
  }, [gpxData]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="distance"
            interval={150}
            label={{ value: "Distance", position: "insideBottom" }}
            
          />
          <YAxis
            label={{
              value: "Elevation (m)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="#000"
            fill="#ffff00"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityElevation;
