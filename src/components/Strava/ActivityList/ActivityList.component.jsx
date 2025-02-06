import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import Connect from "../Connection/Connect.component";
import "../../../sass/ActivityList.scss";
import "../../../sass/Common.css";
import SearchBox from "../../SearchBox/SearchBox.component";

const ActivityList = () => {
  const [activities, setActivities] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filteredActivities, setFilteredActivities] = useState([]); // Szűrt aktivitások
  const [filters, setFilters] = useState({ year: "", month: "" });

  const clientId = process.env.REACT_APP_CLIENT_ID; // Cseréld ki a saját Client ID-re
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET; // Cseréld ki a saját Client Secret-re
  const redirectUri = process.env.REACT_APP_REDIRECT_URI; // Cseréld ki a Redirect URI-ra
  const scope = process.env.REACT_APP_SCOPE; // Szükséges engedélyek

  useEffect(() => {
    const expiresAt = localStorage.getItem("expires_at");
    const token = localStorage.getItem("access_token");

    if (token && expiresAt) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= expiresAt) {
        refreshToken();
      } else {
        setIsAuthorized(true);
        fetchProfile(token);
      }
    } else {
      const query = new URLSearchParams(window.location.search);
      const code = query.get("code");
      if (code) {
        exchangeToken(code);
      } else {
        setIsAuthorized(false); // Ha nincs token, állítsd false-ra
      }
    }
  }, []);

  // Token csere kódról
  const exchangeToken = async (code) => {
    try {
      const response = await axios.post("https://www.strava.com/oauth/token", {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
      });
  
      const { access_token, refresh_token, expires_at } = response.data;
      
      // Tokenek mentése helyi tárolóba
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("expires_at", expires_at);
  
      setIsAuthorized(true);
      fetchProfile(access_token);
    } catch (error) {
      console.error("Error exchanging token:", error);
    }
  };
  

  const refreshToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token");
  
    if (!refresh_token) {
      setIsAuthorized(false);
      return;
    }
  
    try {
      const response = await axios.post("https://www.strava.com/oauth/token", {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refresh_token,
        grant_type: "refresh_token",
      });
  
      const { access_token, refresh_token: new_refresh_token, expires_at } = response.data;
  
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", new_refresh_token);
      localStorage.setItem("expires_at", expires_at);
  
      setIsAuthorized(true);
      fetchProfile(access_token); // Ne felejtsd el újra betölteni az adatokat!
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuthorized(false);
    }
  };
  

  // Felhasználói profil lekérése
  const fetchProfile = async (token) => {
    try {
      const response = await axios.get(
        "https://www.strava.com/api/v3/athlete/activities",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            per_page: 200,
            page: 1,
          },
        }
      );

      setActivities(response.data);
      setFilteredActivities(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  //Szűrés évre és hónapra
  const handleFilters = (year, month) => {
    setFilters({ year, month });

    if (!year && !month) {
      setFilteredActivities(activities); // Ha nincs szűrő, mutassa az összeset
      return;
    }

    const filtered = activities.filter((activity) => {
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
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Link létrehozása és kattintás triggerelése
    const link = document.createElement("a");
    link.href = url;
    link.download = "strava_activities.json";
    link.click();

    // Blob URL felszabadítása
    URL.revokeObjectURL(url);
  };

  // Engedélyezési URL generálása
  const handleAuth = () => {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
  };

  if (!isAuthorized) {
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
          {filteredActivities.map((activity) => (
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
