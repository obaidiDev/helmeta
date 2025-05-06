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

  // 1. Keep your old environmentData for non-vitals
  const [environmentData, setEnvironmentData] = useState(null);
  // 2. New state just for vitals
  const [vitals, setVitals] = useState({ heartBeat: null, respiratoryRate: null });

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

    // 3. Split your listener so it:
    //    a) updates vitals state from the socket payload
    //    b) (optionally) merges any other incoming fields into environmentData
    envSocket.on('environmentUpdate', data => {
      const { heartBeat, respiratoryRate, ...rest } = data;
      setVitals({ heartBeat, respiratoryRate });
      setEnvironmentData(prev => ({
        ...prev,
        ...rest
      }));
    });

    return () => {
      envSocket.off('environmentUpdate');
      envSocket.disconnect();
    };
  }, [workerId]);

  // Initial fetch for the “static” environment metrics
  useEffect(() => {
    if (workerId && !environmentData) {
      fetch(`/api/environment/${workerId}`)
        .then(r => r.json())
        .then(data => {
          // seed both the non-vitals and the vitals on first load
          const { heartBeat, respiratoryRate, ...rest } = data;
          setVitals({ heartBeat, respiratoryRate });
          setEnvironmentData(rest);
        });
    }
  }, [workerId, environmentData]);

  if (!environmentData) {
    return <div className="p-4">Loading environment data for {workerId}…</div>;
  }

  // 4. Render your two vitals cards from the `vitals` state
  const leftMetrics = [
    {
      label: 'Heart Beat',
      value: vitals.heartBeat != null ? `${vitals.heartBeat} BPM` : '–',
      color: getColor(vitals.heartBeat)
    },
    {
      label: 'Respiratory Rate',
      value: vitals.respiratoryRate != null ? `${vitals.respiratoryRate} /min` : '–',
      color: getColor(vitals.spo2)
    },
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
      <img src="/cam" alt="Camera Stream"/>

      <div className="absolute top-4 left-4 z-20">
        {/* ...toggle code unchanged... */}
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 flex justify-between">
        <div className="m-4 space-y-2 pointer-events-auto mt-20">
          {leftMetrics.map(({ label, value, color }) => (
            <DataCard key={label} label={label} value={value} extraClass={color}/>
          ))}
        </div>
        <div className="m-4 space-y-2 pointer-events-auto mt-20">
          {rightMetrics.map(({ label, value, color }) => (
            <DataCard key={label} label={label} value={value} extraClass={color}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveEnvironment;
