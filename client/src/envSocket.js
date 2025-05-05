// src/envSocket.js
import { io } from 'socket.io-client';

const socket = io('', {
  transports: ['polling'],       // ← force polling only
  path: '/socket.io',            // default, but explicit helps
  autoConnect: false,
});

export default socket;
