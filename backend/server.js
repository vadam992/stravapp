require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // Engedélyezze a cookie-k küldését
  })
);

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/token";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// 🔹 1. STRAVA TOKEN LEKÉRÉSE
app.post("/api/auth/strava", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(STRAVA_AUTH_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    });

    const { access_token, refresh_token, expires_at } = response.data;

    // 🔹 HTTP-only cookie beállítása
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true, // Csak HTTPS-en működik (fejlesztésnél lehet false)
      sameSite: "Strict",
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
    });
    res.cookie("expires_at", expires_at, { httpOnly: true, secure: true });

    res.json({ token: access_token, message: "Authenticated with Strava" });
  } catch (error) {
    console.error("Error exchanging token:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
});

// 🔹 2. STRAVA API LEKÉRÉSE TOKEN ELLENŐRZÉSSEL
app.get("/api/strava/data", async (req, res) => {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  let allActivities = [];
  let page = 1;
  let hasMoreData = true;

  try {
    while (hasMoreData) {
      const response = await axios.get(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=200`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = response.data;
      if (data.length === 0) {
        hasMoreData = false;
      } else {
        allActivities = [...allActivities, ...data];
        page++;
      }
    }

    res.json(allActivities);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 429) {
        console.error("Rate limit exceeded! Try again later.");
      } else if (error.response.status === 401) {
        console.error("Unauthorized! Token might be expired.");
      } else {
        console.error("API error:", error.response.status, error.response.data);
      }
    } else {
      console.error("Network error or server is down:", error.message);
    }
    hasMoreData = false;

    res.status(500).json({ message: "Failed to fetch data" });
  }
});

// 🔹 3. TOKEN AUTOMATIKUS FRISSÍTÉSE
app.post("/api/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token available" });
  }

  try {
    const response = await axios.post(STRAVA_AUTH_URL, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const {
      access_token,
      refresh_token: newRefreshToken,
      expires_at,
    } = response.data;

    // Új cookie beállítása
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: true,
    });
    res.cookie("expires_at", expires_at, { httpOnly: true, secure: true });

    res.json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Failed to refresh token" });
  }
});

// 🔹 4. KIJELENTKEZÉS
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.clearCookie("expires_at");

  res.json({ message: "Logged out" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
