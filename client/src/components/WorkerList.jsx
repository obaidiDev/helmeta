// client/src/components/WorkerList.jsx
import React from 'react';
import WorkerCard from './WorkerCard';

const riskPriority = { high: 3, mid: 2, low: 1 };

const WorkerList = ({ workers }) => {
  // Sort by risk descending
  const sortedWorkers = [...workers].sort((a, b) => {
    return riskPriority[b.riskLevel] - riskPriority[a.riskLevel];
  });

  return (
    <div className="mb-4 bg-gray-100 rounded-xl">
      <h2 className=" font-bold text-lg text-black">Workers</h2>
      <div className="flex overflow-x-auto">
        {sortedWorkers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
};

export default WorkerList;
