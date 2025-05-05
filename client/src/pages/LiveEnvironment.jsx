// src/pages/LiveEnvironment.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import envSocket from '../envSocket';

const DataCard = ({ label, value, extraClass = '' }) => (
  <div className={`
    p-2 border bg-white bg-opacity-75 text-black text-sm
    shadow rounded-lg ${extraClass}
  `}>
    <h4 className="font-semibold">{label}</h4>
    <p>{value}</p>
  </div>
);

const LiveEnvironment = () => {
  const { workerId } = useParams();
  const [environmentData, setEnvironmentData] = useState(null);
  const [useCamera, setUseCamera] = useState(true);

  const getColor = v =>
    v > 80 ? 'bg-red-100'
    : v > 50 ? 'bg-yellow-100'
    : 'bg-green-100';

  // Socket-IO subscription
  useEffect(() => {
    if (!workerId) return;
    envSocket.connect();
    envSocket.emit('joinRoom', workerId);
    envSocket.on('environmentUpdate', setEnvironmentData);
    return () => {
      envSocket.off('environmentUpdate', setEnvironmentData);
      envSocket.disconnect();
    };
  }, [workerId]);

  // Initial fetch
  useEffect(() => {
    if (workerId && !environmentData) {
      fetch(`/api/environment/${workerId}`)
        .then(r => r.json())
        .then(setEnvironmentData);
    }
  }, [workerId, environmentData]);

  if (!environmentData) {
    return <div className="p-4">Loading environment data for {workerId}…</div>;
  }

  // Split metrics into two columns
  const leftMetrics = [
    { label: 'Heart Beat', value: `${environmentData.heartBeat} BPM`, color: getColor(environmentData.heartBeat) },
    { label: 'Respiratory Rate', value: `${environmentData.respiratoryRate} /min`, color: getColor(environmentData.respiratoryRate) },
    { label: 'Personal Risk Level', value: environmentData.personalRiskLevel, color: '' },
    { label: 'Region Risk Level', value: environmentData.areaRiskLevel, color: '' },
    { label: 'CO2', value: `${environmentData.co2} ppm`, color: '' },
  ];
  const rightMetrics = [
    { label: 'VOC', value: `${environmentData.voc}`, color: '' },
    { label: 'CH2O', value: `${environmentData.ch2o} mg/m³`, color: '' },
    { label: 'Humidity', value: `${environmentData.humidity}%`, color: '' },
    { label: 'Temperature', value: `${environmentData.temperature}°C`, color: '' },
    { label: 'PM2.5', value: `${environmentData.pm25} μg/m³`, color: '' },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      <iframe
        src="http://192.168.192.155"
        title="Camera Stream"
        className={`
          w-full h-full transition-opacity duration-300
          ${useCamera ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />
      {/* Toggle */}
      <div className="absolute top-4 left-4 z-20">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={useCamera}
            onChange={() => setUseCamera(c => !c)}
          />
          <div className="w-10 h-6 bg-gray-400 rounded-full relative">
            <div className={`dot absolute w-6 h-6 bg-white rounded-full shadow transform transition ${useCamera ? 'translate-x-full' : ''}`} />
          </div>
          <span className="ml-2 text-white">{useCamera ? 'Camera On' : 'Camera Off'}</span>
        </label>
      </div>

      {/* Left & Right Columns */}
      <div className="absolute inset-0 pointer-events-none z-10 flex justify-between">
        {/* Left side */}
        <div className="m-4 space-y-2 pointer-events-auto mt-20">
          {leftMetrics.map(({ label, value, color }) => (
            <DataCard
              key={label}
              label={label}
              value={value}
              extraClass={color}
            />
          ))}
        </div>

        {/* Right side */}
        <div className="m-4 space-y-2 pointer-events-auto mt-20">
          {rightMetrics.map(({ label, value, color }) => (
            <DataCard
              key={label}
              label={label}
              value={value}
              extraClass={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveEnvironment;
