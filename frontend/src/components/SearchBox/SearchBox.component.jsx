import React, { useState } from 'react';

const SearchBox = ({ onApplyFilters, onResetVisibleCount }) => {
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // Keresés indítása a gomb lenyomására
  const handleFilterChange = () => {
    onApplyFilters(filterYear, filterMonth); // A szülő komponens kapja meg az értéket
  };

  const handleResetFilters = () => {
    setFilterYear(''); // Év alaphelyzetbe
    setFilterMonth(''); // Hónap alaphelyzetbe
    onApplyFilters('', ''); // Üres értékek küldése a szülőnek
    onResetVisibleCount();
  };

  return (
    <div className="searchbox">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <label htmlFor="filter-year">Filter by Year:</label>
            <input
              type="number"
              id="filter-year"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="form-control"
              placeholder="YYYY"
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="filter-month">Filter by Month:</label>
            <select
              id="filter-month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="form-control"
            >
              <option value="">All Months</option>
              {[...Array(12)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(0, index).toLocaleString('default', {
                    month: 'long',
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <button className="btn btn-primary" onClick={handleFilterChange}>
              Apply Filters
            </button>
          </div>
          <div className="col-md-6">
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
