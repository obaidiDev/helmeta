// client/src/components/WorkerCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const getColorByRisk = (riskLevel) => {
  switch (riskLevel) {
    case 'high':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'mid':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    default:
      return 'bg-green-100 border-green-300 text-green-800';
  }
};

const WorkerCard = ({ worker }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Remove any hash from the worker's id and navigate to the worker-specific environment page
    const workerId = worker.id.replace('#', '');
    navigate(`/environment/${workerId}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex flex-row border p-2 m-2 w-fit h-fit cursor-pointer bg-white shadow rounded-lg`}
    >
      <img src={worker.image} alt="worker" className="w-auto h-24 mb-2 pr-4 rounded-sm" />
      <div className='flex flex-col my-auto'>
        <div className="text-sm font-bold text-black">{worker.id}</div>
        <div className="text-sm text-black">{worker.name}</div>
      </div>
      <div className={`h-fit p-1 ${getColorByRisk(worker.riskLevel)}`}>
          <div className="text-xs uppercase font-semibold">{worker.riskLevel}</div>
      </div>
    </div>
  );
};

export default WorkerCard;
