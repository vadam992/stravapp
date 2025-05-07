import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { parseISO, format, startOfWeek } from 'date-fns';
import YearlyCyclingStats from '../../components/Stats/YearlyCyclingStats';
import useStravaData from '../../hooks/useStravaData';
import '../../styles/Statistics.scss';

const Satitstics = () => {
  const { data, status } = useStravaData();
  const [mode, setMode] = useState('weekly'); // 'weekly' or 'monthly'
  const [type, setType] = useState('distance'); // 'distance' or 'elevation'
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (status === 'succeeded' && data) {
      const groupedData = groupActivities(data, mode, type);
      const formattedData = Object.entries(groupedData).map(
        ([key, values]) => ({
          name: key,
          value:
            type === 'distance'
              ? (values.distance / 1000).toFixed(2)
              : values.elevation.toFixed(2),
        })
      );
      setChartData(formattedData);
    }
  }, [data, status, mode, type]);

  const groupActivities = (activities, mode, type) => {
    return activities.reduce((acc, activity) => {
      const date = parseISO(activity.start_date);

      const key =
        mode === 'weekly'
          ? format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-ww') // Hétfői kezdés!
          : format(date, 'yyyy-MM'); // Havi bontás

      if (!acc[key]) {
        acc[key] = { distance: 0, elevation: 0 };
      }

      acc[key].distance += activity.distance;
      acc[key].elevation += activity.total_elevation_gain;

      return acc;
    }, {});
  };

  return (
    <div className="ac-list">
      <div className="container">
        <YearlyCyclingStats />
        <div className="row">
          <div className="col-lg-12">
            {status === 'loading' && <p>Adatok betöltése...</p>}
            {status === 'failed' && <p>Hiba történt az adatok betöltésekor.</p>}
            {status === 'succeeded' && (
              <div style={{ width: '100%', height: 500 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, mode === 'weekly' ? 400 : 1000]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#e5a333" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <div>
              <button
                className="button yellow"
                onClick={() => setMode('weekly')}
                disabled={mode === 'weekly'}
              >
                Heti
              </button>
              <button
                className="button yellow"
                onClick={() => setMode('monthly')}
                disabled={mode === 'monthly'}
              >
                Havi
              </button>
              <button
                className="button yellow"
                onClick={() => setType('distance')}
                disabled={type === 'distance'}
              >
                Távolság
              </button>
              <button
                className="button yellow"
                onClick={() => setType('elevation')}
                disabled={type === 'elevation'}
              >
                Szintemelkedés
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Satitstics;
