// client/src/components/IndoorMap.jsx
import React, { useEffect } from 'react';
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
    // Initialize the fullscreen control with desired options
    const fsControl = L.control.fullscreen({
      position: 'topright',
      title: 'View Fullscreen',
      titleCancel: 'Exit Fullscreen',
      forceSeparateButton: true,
    });
    fsControl.addTo(map);

    // Cleanup on unmount
    return () => {
      fsControl.remove();
    };
  }, [map]);

  return null;
};

const IndoorMap = ({ workers, riskAssessments }) => {
  const navigate = useNavigate();

  const handleWorkerClick = (id) => {
    // Remove any hash character and navigate to the worker-specific environment page
    const workerId = id.replace('#', '');
    navigate(`/environment/${workerId}`);
  };

  // Define the bounds of your floor plan image (adjust these values according to your floor plan dimensions)
  const bounds = [[0, 0], [1000, 1000]];

  return (
    <div className="rounded-xl shadow-md overflow-hidden col-span-3 bg-white px-4">
      <h2 className="text-lg py-4 font-bold text-black">Indoor Map</h2>
      <MapContainer
        style={{ height: '80%', width: '100%' }}
        crs={L.CRS.Simple}
        center={[500, 500]} // Adjust center as needed for your floor plan
        zoom={0}
        minZoom={-1}
        maxZoom={4}
      >
        {/* Add the fullscreen control component */}
        <FullscreenControl />

        {/* Overlay your custom floor plan image */}
        <ImageOverlay
          url="/Floor-Plan.jpg" // Replace with the path to your floor plan image
          bounds={bounds}
        />

        {/* Render a custom marker for each worker */}
        {workers.map((worker, index) => {
          // Determine risk level to set marker color
          const isRisk = worker.riskLevel === 'high' || worker.riskLevel === 'mid';
          // Calculate a sample position; replace this logic with your actual coordinates mapping
          const position = [10 + index * 200, 50 + index * 200];

          // Create a custom divIcon with worker id and risk-based coloring
          const markerIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background:${isRisk ? 'red' : 'green'}; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:white; font-size:12px;">${worker.id}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          return (
            <Marker
              key={worker.id}
              position={position}
              icon={markerIcon}
              eventHandlers={{
                click: () => handleWorkerClick(worker.id),
              }}
            >
              <Popup>
                <span>{worker.id}</span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default IndoorMap;
