import React from 'react';
import '../../../styles/Connection.scss';

const Connect = ({ handleAuth }) => (
  <div className="section-connection">
    <div className="container center">
      <div className="row">
        <div className="col-lg-12">
          <div className="connection-box">
            <h1>Authorize with Strava</h1>
            <button className="connection-button" onClick={handleAuth}>
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Connect;
