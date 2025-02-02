import React from 'react';

const Connect = ({ handleAuth }) => (
    <div>
        <h1>Authorize Strava</h1>
        <button onClick={handleAuth}>Authorize with Strava</button>
      </div>
  );
  
  export default Connect;