// client/src/components/PredictionAnalysisContainer.jsx
import React from 'react';
import PredictionAnalysisCard from './PredictionAnalysisCard';

const PredictionAnalysisContainer = ({ predictionAnalysis }) => {
  return (
    <div>
      <h2 className="font-bold mb-2 text-black">Prediction Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {predictionAnalysis.map((analysis, idx) => (
          <PredictionAnalysisCard key={idx} analysis={analysis} />
        ))}
      </div>
    </div>
  );
};

export default PredictionAnalysisContainer;
