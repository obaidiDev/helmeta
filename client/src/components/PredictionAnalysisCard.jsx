// client/src/components/PredictionAnalysisCard.jsx
import React from 'react';

const getColorBySeverity = (severity) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'mid':
    case 'medium':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    default:
      return 'bg-green-100 border-green-300 text-green-800';
  }
};

const PredictionAnalysisCard = ({ analysis }) => {
  return (
    <div className={`p-2 border mb-2 relative ${getColorBySeverity(analysis.severity)}`}>
      <div className="absolute top-2 right-2 font-bold uppercase">{analysis.severity}</div>
      <h4 className="font-bold">{analysis.targetName}</h4>
      <p className="text-sm">{analysis.description}</p>
    </div>
  );
};

export default PredictionAnalysisCard;
