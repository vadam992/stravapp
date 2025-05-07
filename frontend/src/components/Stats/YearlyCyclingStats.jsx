import React, { useMemo } from 'react';
import { isAfter, parseISO, format } from 'date-fns';
import useStravaData from '../../hooks/useStravaData';

const YearlyCyclingStats = () => {
  const { data, status } = useStravaData();

  const {
    yearlyData,
    longestRide,
    biggestSpeed,
    bestAvarageSpeed,
    bestElevation,
  } = useMemo(() => {
    if (status !== 'succeeded' || !data) {
      return { yearlyData: [], longestRide: null };
    }

    const rides = data.filter(act => act.type === 'Ride');

    const grouped = rides.reduce((acc, act) => {
      const year = format(parseISO(act.start_date), 'yyyy');
      if (!acc[year]) acc[year] = 0;
      acc[year] += act.distance;
      return acc;
    }, {});

    const yearlyData = Object.entries(grouped)
      .map(([year, distance]) => ({
        year,
        distanceKm: (distance / 1000).toFixed(2),
      }))
      .sort((a, b) => b.year - a.year);

    const longestRide = rides.reduce(
      (max, act) => (act.distance > max.distance ? act : max),
      { distance: 0 }
    );
    console.log(rides);
    const startYear = 2023;
    const startMonth = 3;
    const filterStartDate = new Date(startYear, startMonth - 1);

    const filteredRides = rides.filter(act => {
      const activityDate = parseISO(act.start_date);
      return isAfter(activityDate, filterStartDate);
    });

    const biggestSpeed = filteredRides.reduce(
      (max, act) => (act.max_speed > max.max_speed ? act : max),
      { max_speed: 0 }
    );

    const bestAvarageSpeed = filteredRides.reduce(
      (max, act) => (act.average_speed > max.average_speed ? act : max),
      { average_speed: 0 }
    );

    const bestElevation = rides.reduce(
      (max, act) =>
        act.total_elevation_gain > max.total_elevation_gain ? act : max,
      { total_elevation_gain: 0 }
    );

    return {
      yearlyData,
      longestRide,
      biggestSpeed,
      bestAvarageSpeed,
      bestElevation,
    };
  }, [data, status]);

  if (status === 'loading') return <p>Adatok betöltése...</p>;
  if (status === 'failed') return <p>Hiba történt az adatok betöltésekor.</p>;

  return (
    <div className="row statistics">
      <div className="col-lg-6">
        {longestRide && (
          <div className="longest-ride">
            Longest distance:{' '}
            <strong>{(longestRide.distance / 1000).toFixed(2)} km</strong> (
            {new Date(longestRide.start_date).toLocaleDateString()})
          </div>
        )}
        {biggestSpeed && (
          <div className="longest-ride">
            Maximum speed:{' '}
            <strong>{(biggestSpeed.max_speed * 3.6).toFixed(1)} km/h</strong> (
            {new Date(biggestSpeed.start_date).toLocaleDateString()})
          </div>
        )}
        {bestAvarageSpeed && (
          <div className="longest-ride">
            Highest average speed:{' '}
            <strong>
              {(bestAvarageSpeed.average_speed * 3.6).toFixed(1)} km/h
            </strong>{' '}
            ({new Date(bestAvarageSpeed.start_date).toLocaleDateString()} -{' '}
            {(bestAvarageSpeed.distance / 1000).toFixed(2)} km)
          </div>
        )}
        {bestElevation && (
          <div className="longest-ride">
            Biggest climb:{' '}
            <strong>{bestElevation.total_elevation_gain} m</strong> (
            {new Date(bestElevation.start_date).toLocaleDateString()} -{' '}
            {(bestElevation.distance / 1000).toFixed(2)} km)
          </div>
        )}
      </div>
      <div className="col-lg-6">
        <div className="yearly-stats">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Total distance</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map(({ year, distanceKm }) => (
                <tr key={year}>
                  <td>{year}</td>
                  <td>{distanceKm} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyCyclingStats;
