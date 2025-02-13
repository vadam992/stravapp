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
    isLoading,
    isAuthorized,
    visibleCount,
    setVisibleCount,
  } = useActivities({ visibleCount: 12 });

  if (!isAuthorized) {
    return <Connect handleAuth={handleAuth} />;
  }

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="ac-list">
      <div className="container">
        <SearchFilters onApplyFilters={handleFilters} onResetVisibleCount={() => setVisibleCount(12)}/>
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
