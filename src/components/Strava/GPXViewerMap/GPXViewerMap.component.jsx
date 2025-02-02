import React, { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet-gpx";
import gpxParser from "gpxparser";

const GPXViewerMap = (props) => {
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

  useEffect(() => {
    if (mapRef.current && gpxData) {
      const map = mapRef.current;

      const gpxLayer = new L.GPX(props.gpxUrl, {
        async: true,
        marker_options: {
          startIconUrl:
            "https://leafletjs.com/examples/custom-icons/leaf-green.png",
          endIconUrl:
            "https://leafletjs.com/examples/custom-icons/leaf-red.png",
        },
      })
        .on("loaded", (e) => {
          map.fitBounds(e.target.getBounds());
        })
        .addTo(map);

      // Eltávolítjuk a réteget, ha a komponens újra renderelődik vagy eltávolításra kerül
      return () => {
        map.removeLayer(gpxLayer);
      };
    }
  }, [gpxData, props.gpxUrl]);

  return (
    <MapContainer
      center={positions[0] || [0, 0]}
      zoom={10}
      style={{ height: "500px", width: "100%" }}
      whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {positions.length > 0 && (
        <Polyline
          pathOptions={{ fillColor: "red", color: "blue" }}
          positions={positions}
        />
      )}
    </MapContainer>
  );
};

export default GPXViewerMap;
