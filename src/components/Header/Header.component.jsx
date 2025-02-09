import React from 'react';
import { Link } from "react-router-dom";
import '../../sass/Header.scss';

const App = () => {
  return (
      <div className='header'>
          <img className='header__logo' src="/route-viewer.png" alt="" />
          <h1 className='header__title'>Strava viewer</h1>
          <div className="nav-menu">
            <nav>
              <ul>
                <li><Link to="/">List Activity</Link></li>
                <li><Link to="/statistics">Statistics</Link></li>
                <li><Link to="/refresh-data">Datas</Link></li>
              </ul>
            </nav>
          </div>
      </div>
  );
}

export default App;
