// src/components/CameraBackground.jsx
import React, { useEffect, useRef } from 'react';
import JSMpegPlayer from '@cycjimmy/jsmpeg-player';

const CameraBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // point at your RTSP→WebSocket bridge
    const STREAM_URL = 'ws://localhost:9999';

    // instantiate the player onto the canvas
    const player = new JSMpegPlayer(STREAM_URL, {
      canvas:  canvasRef.current,
      autoplay: true,
      loop:     true,   // optional
      // you can pass any of the Player options here
    });

    return () => {
      // cleanup on unmount
      player.destroy();
    };
  }, []);

  // absolutely position behind everything else
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
    />
  );
};

export default CameraBackground;
