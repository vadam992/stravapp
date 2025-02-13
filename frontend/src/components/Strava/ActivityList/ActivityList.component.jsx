import React from 'react';
import { Link } from 'react-router-dom';

const ActivityGrid = ({ activities, visibleCount, setVisibleCount }) => {
  const loadMore = () => {
    setVisibleCount(prevCount => prevCount + 12); // 12-vel növeljük a megjelenített elemek számát
  };

  return (
    <div className="row">
      {activities.slice(0, visibleCount).map(activity => (
        <div className="col-12 col-xl-4 col-md-6 col-sm-6" key={activity.id}>
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
      <div className="col-12">
        {visibleCount < activities.length && (
          <div className="text-center mt-3">
            <button className="btn btn-primary" onClick={loadMore}>
              További betöltés
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityGrid;
