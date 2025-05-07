// client/src/components/IndoorMap.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import the Fullscreen plugin CSS and JS
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet.fullscreen/Control.FullScreen.js';

// Component to add a fullscreen control to the map
const FullscreenControl = () => {
  const map = useMap();

  useEffect(() => {
    const fsControl = L.control.fullscreen({
      position: 'topright',
      title: 'View Fullscreen',
      titleCancel: 'Exit Fullscreen',
      forceSeparateButton: true,
    });
    fsControl.addTo(map);
    return () => fsControl.remove();
  }, [map]);

  return null;
};

const IndoorMap = ({ workers, riskAssessments }) => {
  const navigate = useNavigate();
  const [tagStates, setTagStates] = useState({});

  // Navigate on worker click
  const handleWorkerClick = id => {
    const workerId = id.replace('#', '');
    navigate(`/environment/${workerId}`);
  };

  // Subscribe to UWB tag positions via raw WebSocket on /uwb
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${window.location.host}/uwb`);

    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        // data: { id, name, riskLevel, position: { x, y } }
        setTagStates(prev => ({ ...prev, [data.id]: data }));
      } catch (err) {
        console.error('Invalid JSON from /uwb:', event.data);
      }
    };
    socket.onopen = () => console.log('WebSocket /uwb connected');
    socket.onclose = () => console.log('WebSocket /uwb disconnected');
    return () => socket.close();
  }, []);

  // Define floor plan bounds
  const bounds = [[0, 0], [1000, 1000]];

  return (
    <div className="rounded-xl shadow-md overflow-hidden col-span-3 bg-white px-4">
      <h2 className="text-lg py-4 font-bold text-black">Indoor Map</h2>
      <MapContainer
        style={{ height: '80%', width: '100%' }}
        crs={L.CRS.Simple}
        center={[500, 500]}
        zoom={0}
        minZoom={-1}
        maxZoom={4}
      >
        <FullscreenControl />
        <ImageOverlay url="/Floor-Plan.jpg" bounds={bounds} />

        {/* Static workers markers */}
        {workers.map((worker, idx) => {
          const isRisk = worker.riskLevel === 'high' || worker.riskLevel === 'mid';
          const position = [10 + idx * 200, 50 + idx * 200];
          const workerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background:${isRisk ? 'red' : 'green'};border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">${worker.id}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });
          return (
            <Marker
              key={worker.id}
              position={position}
              icon={workerIcon}
              eventHandlers={{ click: () => handleWorkerClick(worker.id) }}
            >
              <Popup>{worker.id}</Popup>
            </Marker>
          );
        })}

        {/* Dynamic UWB tag markers */}
        {Object.entries(tagStates).map(([id, tag]) => {
          const { position, riskLevel } = tag;
          // Map position.x,y (0-1) to floor plan coords (0-1000)
          const x = position.x * 1000;
          const y = position.y * 1000;
          const color = riskLevel === 'low' ? 'green' : riskLevel === 'mid' ? 'yellow' : 'red';
          const tagIcon = L.divIcon({
            html: `<div style="background:${color};border-radius:50%;width:20px;height:20px;border:2px solid white;"></div>`,
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
          return (
            <Marker key={id} position={[y, x]} icon={tagIcon}>
              <Popup>{`${id} (${riskLevel})`}</Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndoorMap;
