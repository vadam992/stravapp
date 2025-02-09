import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ActivityList from '../components/Strava/ActivityList/ActivityList.component';
import ActivityDetails from '../components/Strava/ActivityDetails/ActivityDetails.component';
import Statistics from '../pages/Statistics/Statistics';
import RefreshJsonPage from '../pages/RefreshJson/RefreshJson';
import Layout from '../components/Layout';

const AppRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<ActivityList />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/refresh-data" element={<RefreshJsonPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoute;
