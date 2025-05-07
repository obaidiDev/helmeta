// client/src/components/FilterBar.jsx
import React from 'react';

const filters = [
  { label: 'Alerts', value: 'alerts' },
  { label: 'Risk Assessments', value: 'risk' },
  { label: 'Worker List', value: 'workers' },
  // { label: 'Prediction Analysis', value: 'prediction' },
];

const FilterBar = ({ selectedFilters, setSelectedFilters }) => {
  // Toggle filter
  const handleToggle = (value) => {
    if (selectedFilters.includes(value)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== value));
    } else {
      setSelectedFilters([...selectedFilters, value]);
    }
  };

  return (
    <div className="flex space-x-4 mb-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleToggle(filter.value)}
          className={`p-2 bg-white rounded-full text-black hover:bg-gray-200
            ${selectedFilters.includes(filter.value) ? 'bg-blue-500' : 'bg-gray-100'}
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
