import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ActivityDetails from '../components/Strava/ActivityDetails/ActivityDetails.component';
import Statistics from '../pages/Statistics/Statistics';
import Layout from '../components/Layout';
import ActivityListPage from '../pages/ActivityList/ActivityList';
import RefreshJsonPage from '../pages/RefreshJson/RefreshJsonPage';

const AppRoute = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<ActivityListPage />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/refresh-data" element={<RefreshJsonPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoute;
