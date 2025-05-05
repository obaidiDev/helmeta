// client/src/components/RiskAssessmentCard.jsx
import React from 'react';

const getColorByRisk = (riskLevel) => {
  switch (riskLevel) {
    case 'high':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'mid':
    case 'medium':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    default:
      return 'bg-green-100 border-green-300 text-green-800';
  }
};

const RiskAssessmentCard = ({ assessment }) => {
  return (
    <div
      className={`border p-2 mb-2 grid grid-cols-5 shadow rounded-lg w-full h-fit`}
    >
      <div className='flex flex-col col-start-1 col-end-5'>
        <h2 className="font-bold text-black">
          {assessment.name} - {assessment.region}
        </h2>
        <p className="text-sm text-black">{assessment.riskDescription}</p>
      </div>
        <div className={`h-fit ${getColorByRisk(assessment.riskLevel)} p-1 text-xs uppercase font-semibold text-center`}>
          {assessment.riskLevel}
        </div>
    </div>
    
  );
};

export default RiskAssessmentCard;
