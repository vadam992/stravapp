import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStravaData } from '../data/stravaSlice';

const useStravaData = () => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector(state => state.strava);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStravaData());
    }
  }, [status, dispatch]);

  return { data, status, error };
};

export default useStravaData;
