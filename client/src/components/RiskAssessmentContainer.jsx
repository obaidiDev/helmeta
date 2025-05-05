// client/src/components/RiskAssessmentContainer.jsx
import React from 'react';
import RiskAssessmentCard from './RiskAssessmentCard';

const RiskAssessmentContainer = ({ riskAssessments }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md overflow-auto col-span-1">
      <h2 className="font-bold text-lg text-black mb-4">Risk Assessment</h2>
      {riskAssessments.map((assessment, idx) => (
        <RiskAssessmentCard key={idx} assessment={assessment} />
      ))}
    </div>
  );
};

export default RiskAssessmentContainer;
