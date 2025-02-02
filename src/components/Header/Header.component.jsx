import React from 'react';
import '../../sass/Header.scss';

const App = () => {
  return (
    <div className='header'>
        <img className='header__logo' src="/route-viewer.png" alt="" />
        <h1 className='header__title'>Strava viewer</h1>
    </div>
  );
}

export default App;
