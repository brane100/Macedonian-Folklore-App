import React, { createContext, useContext, useState } from 'react';

// Create the Filter Context
const FilterContext = createContext();

// Custom hook to use the Filter Context
export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

// Simple Filter Provider - only handles map-to-posts region communication
export const FilterProvider = ({ children }) => {
  const [regionFilter, setRegionFilter] = useState('');

  const clearRegionFilter = () => {
    setRegionFilter('');
  };

  const value = {
    regionFilter,
    setRegionFilter,
    clearRegionFilter,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterProvider;
