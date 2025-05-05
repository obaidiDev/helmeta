// src/components/VideoPlayer.jsx
import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';

const VideoPlayer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !window.JSMpeg) return;
    const player = new window.JSMpeg.Player('ws://localhost:9999', {
      canvas: canvasRef.current,
      autoplay: true,
      audio: false,
    });
    return () => player.destroy();
  }, []);

  return (
    <>
      <Helmet>
        <script src="https://cdn.jsdelivr.net/npm/jsmpeg@1.0.0/jsmpeg.min.js" />
      </Helmet>
      <canvas ref={canvasRef} className="w-full h-full" />
    </>
  );
};

export default VideoPlayer;
