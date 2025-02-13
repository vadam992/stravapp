import { Outlet } from 'react-router-dom';
import Header from './Header/Header.component';

const Layout = () => {
  return (
    <div className="layout">
      <Header />
      <div className="content">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
