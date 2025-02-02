import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ActivityList from '../../components/Strava/ActivityList/ActivityList.component'; 
import ActivityDetails from '../../components/Strava/ActivityDetails/ActivityDetails.component'; 

const AppRoute = () => {
  return (
    <Router>
      <Routes>
        {/* Főoldal az aktivitások listájával */}
        <Route path="/" element={<ActivityList />} />

        {/* Dinamikus útvonal egy adott aktivitás részleteihez */}
        <Route path="/activity/:id" element={<ActivityDetails />} />
      </Routes>
    </Router>
  );
};

export default AppRoute;