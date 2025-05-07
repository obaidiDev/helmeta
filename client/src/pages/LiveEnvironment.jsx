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
  const [vitals, setVitals] = useState({ heartRate: null, spo2: null });
  const [useCameraBackground, setUseCameraBackground] = useState(true);

  // generic color helper per metric
  const getCardColor = (label, raw) => {
    const v = parseFloat(raw);
    if (isNaN(v)) return ''; // non-numeric

    switch (label) {
      case 'H2S Level':
        return v > 3    ? 'bg-red-100'
             : v > 1    ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'Heart Beat':
        return v > 100 || v < 50 ? 'bg-red-100'
             : v > 90 || v < 60  ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'Respiratory Rate':
        return v > 100 || v < 60   ? 'bg-red-100'
             : v < 80  ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'Speed':
        return v > 5    ? 'bg-red-100'
             : v > 2    ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'CO2':
        return v > 1000 ? 'bg-red-100'
             : v > 600  ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'VOC':
        return v > 1    ? 'bg-red-100'
             : v > 0.5  ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'CH2O':
        return v > 0.1  ? 'bg-red-100'
             : v > 0.05 ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'Humidity':
        return v > 70   ? 'bg-red-100'
             : v > 40   ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'Temperature':
        return v > 30   ? 'bg-red-100'
             : v > 20   ? 'bg-yellow-100'
                       : 'bg-green-100';

      case 'PM2.5':
        return v > 35   ? 'bg-red-100'
             : v > 12   ? 'bg-yellow-100'
                       : 'bg-green-100';

      default:
        return '';
    }
  };

  // Socket-IO subscription
  useEffect(() => {
    if (!workerId) return;
    envSocket.connect();
    envSocket.emit('joinRoom', workerId);

    envSocket.on('environmentUpdate', data => {
      const { heartRate, spo2, ...rest } = data;
      setVitals({ heartRate, spo2 });
      setEnvironmentData(prev => ({ ...prev, ...rest }));
    });

    return () => {
      envSocket.off('environmentUpdate');
      envSocket.disconnect();
    };
  }, [workerId]);

  // Initial fetch
  useEffect(() => {
    if (workerId && !environmentData) {
      fetch(`/api/environment/${workerId}`)
        .then(r => r.json())
        .then(data => {
          const { heartRate, spo2, ...rest } = data;
          setVitals({ heartRate, spo2 });
          setEnvironmentData(rest);
        });
    }
  }, [workerId, environmentData]);

  const toggleBackground = () => {
    setUseCameraBackground(prev => !prev);
  };

  if (!environmentData) {
    return <div className="p-4">Loading environment data for {workerId}…</div>;
  }

  // build metrics arrays, compute color on the fly
  const leftMetrics = [
    {
      label: 'H2S Level',
      value: environmentData.h2s_voltage,
      color: getCardColor('H2S Level', environmentData.h2s_voltage)
    },
    {
      label: 'Heart Beat',
      value: vitals.heartRate != null ? `${vitals.heartRate} BPM` : '–',
      color: getCardColor('Heart Beat', vitals.heartRate)
    },
    {
      label: 'Respiratory Rate',
      value: vitals.spo2 != null ? `${vitals.spo2} %` : '–',
      color: getCardColor('SpO2', vitals.spo2)
    },
    {
      label: 'Speed',
      value: environmentData.speed != null ? `${environmentData.speed} %` : '–',
      color: getCardColor('Speed', environmentData.speed)
    },
    {
      label: 'CO2',
      value: `${environmentData.co2} ppm`,
      color: getCardColor('CO2', environmentData.co2)
    },
  ];

  const rightMetrics = [
    {
      label: 'VOC',
      value: `${environmentData.voc}`,
      color: getCardColor('VOC', environmentData.voc)
    },
    {
      label: 'CH2O',
      value: `${environmentData.ch2o} mg/m³`,
      color: getCardColor('CH2O', environmentData.ch2o)
    },
    {
      label: 'Humidity',
      value: `${environmentData.humidity}%`,
      color: getCardColor('Humidity', environmentData.humidity)
    },
    {
      label: 'Temperature',
      value: `${environmentData.temperature}°C`,
      color: getCardColor('Temperature', environmentData.temperature)
    },
    {
      label: 'PM2.5',
      value: `${environmentData.pm25} μg/m³`,
      color: getCardColor('PM2.5', environmentData.pm25)
    },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
            {/* Toggle Switch */}
            <div className="p-4">
        <label htmlFor="toggleCamera" className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              id="toggleCamera"
              type="checkbox"
              className="sr-only"
              onChange={toggleBackground}
              checked={useCameraBackground}
            />
            <div className="w-10 h-6 bg-gray-400 rounded-full shadow-inner">
              <div
                className="dot absolute w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200"
                style={{ transform: useCameraBackground ? 'translateX(100%)' : 'translateX(0)' }}
              ></div>
            </div>
          </div>
          <span className="ml-3 text-gray-700 font-medium">
            {useCameraBackground ? "Camera On" : "Camera Off"}
          </span>
        </label>
      </div>
        {<iframe
         src="https://6a38-163-116-191-40.ngrok-free.app/stream"
         title="Camera Stream"
         className={`
           w-full h-full transition-opacity duration-300
           ${useCameraBackground ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
         `}/>}

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
