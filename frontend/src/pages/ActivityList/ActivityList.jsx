import React from 'react';
import { useActivities } from '../../hooks/useActivities';
import SearchFilters from '../../components/SearchBox/SearchBox.component';
import ActivityList from '../../components/Strava/ActivityList/ActivityList.component';
import Connect from '../../components/Strava/Connection/Connect.component';
import '../../styles/ActivityList.scss';

const ActivityListPage = () => {
  const {
    filteredActivities,
    handleFilters,
    handleAuth,
    isAuthorized,
    visibleCount,
    setVisibleCount,
    status,
    error,
  } = useActivities({ visibleCount: 12 });

  if (!isAuthorized) {
    return <Connect handleAuth={handleAuth} />;
  }

  if (status === 'loading')
    return (
      <div className="ac-list">
        <div className="container">
          <p>Adatok betöltése...</p>
        </div>
      </div>
    );
  if (status === 'failed') return <p>Hiba történt: {error}</p>;

  return (
    <div className="ac-list">
      <div className="container">
        <SearchFilters
          onApplyFilters={handleFilters}
          onResetVisibleCount={() => setVisibleCount(12)}
        />
        <ActivityList
          activities={filteredActivities}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
        />
      </div>
    </div>
  );
};

export default ActivityListPage;
