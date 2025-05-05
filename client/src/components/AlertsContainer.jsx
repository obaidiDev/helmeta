// client/src/components/AlertsContainer.jsx
import React from 'react';
import AlertCard from './AlertCard';

const AlertsContainer = ({ alerts }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md overflow-auto col-span-1">
      <h3 className="text-black text-lg font-bold mb-4">Alerts</h3>
      {alerts.map((alert, idx) => (
        <AlertCard key={idx} alert={alert} className="mt-3"/>
      ))}
    </div>
  );
};

export default AlertsContainer;
