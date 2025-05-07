// client/src/components/AlertCard.jsx
import React from 'react';

const AlertCard = ({ alert, onRemove }) => {
  return (
    <div className="flex items-start border-l-4 border-red-600 bg-white p-2 mb-2 shadow-sm">
      <img
        src="public/alert.png"
        alt="Alert Icon"
        className="w-6 h-6 mr-4 my-auto"
      />
      <div>
        <h4 className="font-bold text-red-600">{alert.title}</h4>
        <p className="text-gray-700">{alert.description}</p>
      </div>
      <span
       onClick={onRemove}
       className="relative top-1 left-1 text-gray-500 hover:text-red-600 w-1 h-1 cursor-pointer"
       aria-label="Dismiss alert"
     >
       &times;
     </span>
    </div>
  );
};

export default AlertCard;
