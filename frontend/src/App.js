import AppRoute from './routes/Routes.component';
import './styles/Common.css';
import './styles/Button.scss';
import { Provider } from 'react-redux';
import { store } from './data/store';

const App = () => {
  return (
    <Provider store={store}>
      <AppRoute />
    </Provider>
  );
};

export default App;
