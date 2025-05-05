// client/src/components/AlertCard.jsx
import React from 'react';

const AlertCard = ({ alert }) => {
  return (
    <div className="flex items-start border-l-4 border-red-600 bg-white p-2 mb-2 shadow-sm">
      <img
        src="/alert.png"
        alt="Alert Icon"
        className="w-6 h-6 mr-4 my-auto"
      />
      <div>
        <h4 className="font-bold text-red-600">{alert.title}</h4>
        <p className="text-gray-700">{alert.description}</p>
      </div>
    </div>
  );
};

export default AlertCard;
