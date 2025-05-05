const WebSocket = require('ws');

// Create raw WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('✅ ESP32 connected');

  ws.on('message', (message) => {
    console.log('📩 Received:', message.toString());

    // Optional: Echo back to ESP32
    ws.send('ACK');

    // Optional: Broadcast to other clients (React, etc.)
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('❌ ESP32 disconnected');
  });
});
