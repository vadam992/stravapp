import React, { useState } from "react";
import AppRoute from './components/routes/Routes.component';
import Header from './components/Header/Header.component';

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Ez a függvény frissíti az állapotot
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div>
      <Header />
      <AppRoute />
    </div>
  );
}

export default App;
