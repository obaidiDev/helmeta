// server/server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');  // <-- add this clearly
const { Server } = require('socket.io');
const WebSocket = require('ws');
// const Stream = require('node-rtsp-stream');
const app = express();
const PORT = process.env.PORT || 3000;
const ESP32_CAMERA_URL = 'http://192.168.192.155';
const ESP32_WS_PORT = 8080; // <- Raw WebSocket server for ESP32
const DW1000_WS_PORT = 8081; // <- Raw WebSocket server for ESP32


// Create an HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  // Only allow your React app host
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET","POST"],
    credentials: true
  },
  // Use polling first (so the client handshakes over HTTP),
  // then optionally upgrade to websocket if you ever want it.
  transports: ["polling"]  // <— prevents the bad websocket frames
});


// Middleware
// app.use(
//   '/cam',
//   createProxyMiddleware({
//     target: 'http://192.168.192.155',    // ← your ESP32 IP
//     changeOrigin: true,
//     pathRewrite: { '^/cam': '/stream' },
//     ws: false,
//     onProxyReq: (proxyReq, req, res) => proxyReq.setHeader('Connection', 'keep-alive'),
//     onProxyRes: (proxyRes) => {
//       proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173';
//       proxyRes.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
//       proxyRes.headers['Cache-Control'] = 'no-cache';
//     }
//   })
// );
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- Mock Data ---
let workers = [
  { id: "001", name: "Hashem Alsayed", riskLevel: "high", image: "/person.png" },
  { id: "002", name: "Malek Alrodwan", riskLevel: "mid", image: "/person.png" },
  { id: "003", name: "Ali Alyamy", riskLevel: "low", image: "/person.png" },
  { id: "004", name: "Mohammed Alsakka", riskLevel: "high", image: "/person.png" },
  { id: "005", name: "Meshal Alsalhi", riskLevel: "mid", image: "/person.png" },
];

let alerts = [
  { title: "High O2 Detected", description: "O2 level above normal thresholds", icon: "https://via.placeholder.com/24/FF0000/FFFFFF?text=!" },
];

let riskAssessments = [
  { name: "Worker A", region: "Region 1", riskDescription: "May face low oxygen.", riskLevel: "high" },
  { name: "Worker B", region: "Region 3", riskDescription: "Temperature too high.", riskLevel: "mid" },
];

let predictionAnalysis = [
  { targetName: "Worker 022", description: "Likely to experience heat fatigue.", severity: "high" },
  { targetName: "Region 1", description: "Risk of slip due to moisture.", severity: "mid" },
];

const defaultEnv = {
  heartRate: 80,
  spo2: 16,
  personalRiskLevel: "high",
  areaRiskLevel: "medium",
  CO2: 400,            // Parts per million (example)
  VOC: 0.5,            // Volatile Organic Compounds (example)
  CH2O: 0.05,          // Formaldehyde in mg/m³ (example)
  Humidity: 50,        // Percent (%)
  Temprature: 22,      // Degrees Celsius (example; note spelling as requested)
  "PM2.5": 12          // Micrograms per cubic meter (example)
};

let environmentDataByWorker = {
  "001": { ...defaultEnv },
  "002": { ...defaultEnv, heartRate: 70 },
  "003": { ...defaultEnv, heartRate: 90 },
  "004": { ...defaultEnv, heartRate: 70 },
  "005": { ...defaultEnv, heartRate: 90 },
};

// --- Express API Endpoints ---
app.get('/api/workers', (req, res) => res.json(workers));
app.get('/api/alerts', (req, res) => res.json(alerts));
app.get('/api/risk-assessments', (req, res) => res.json(riskAssessments));
app.get('/api/prediction-analysis', (req, res) => res.json(predictionAnalysis));

app.get('/api/environment/:workerId', (req, res) => {
  const { workerId } = req.params;
  const envData = environmentDataByWorker[workerId] || defaultEnv;
  res.json(envData);
});

app.post('/api/update-environment/:workerId', (req, res) => {
  const { workerId } = req.params;
  environmentDataByWorker[workerId] = { ...req.body };
  io.to(workerId).emit('environmentUpdate', environmentDataByWorker[workerId]);
  res.status(200).json({ message: `Environment data updated for worker ${workerId}.` });
});

app.post('/api/update-workers', (req, res) => {
  req.body.forEach(newWorker => {
    const existingIndex = workers.findIndex(w => w.id === newWorker.id);
    if (existingIndex !== -1) {
      workers[existingIndex] = newWorker; // update
    } else {
      workers.push(newWorker); // add
    }
  });

  io.emit('workersUpdate', workers); // send to frontend
  res.status(200).json({ message: "Workers updated." });
});

app.post('/api/update-alerts', (req, res) => {
  req.body.forEach(newAlert => {
    const exists = alerts.some(alert => alert.title === newAlert.title && alert.description === newAlert.description);
    if (!exists) alerts.push(newAlert);
  });
  io.emit('alertsUpdate', alerts);
  res.status(200).json({ message: "Alerts data updated." });
});

// DELETE /api/alerts
app.delete('/api/update-alerts', (req, res) => {
  const { title, description } = req.body;
  // remove any alert matching both title+description
  alerts = alerts.filter(a =>
    !(a.title === title && a.description === description)
  );
  // broadcast the updated list
  io.emit('alertsUpdate', alerts);
  res.json({ message: 'Alert deleted.' });
});



app.post('/api/update-risk-assessments', (req, res) => {
  req.body.forEach(newItem => {
    const index = riskAssessments.findIndex(r =>
      r.name === newItem.name && r.region === newItem.region
    );
    if (index !== -1) riskAssessments[index] = newItem;
    else riskAssessments.push(newItem);
  });
  io.emit('riskAssessmentsUpdate', riskAssessments);
  res.status(200).json({ message: "Risk assessments updated." });
});


app.post('/api/update-prediction-analysis', (req, res) => {
  req.body.forEach(newItem => {
    const index = predictionAnalysis.findIndex(p =>
      p.targetName === newItem.targetName
    );
    if (index !== -1) predictionAnalysis[index] = newItem;
    else predictionAnalysis.push(newItem);
  });
  io.emit('predictionAnalysisUpdate', predictionAnalysis);
  res.status(200).json({ message: "Prediction analysis updated." });
});

app.post('/api/vitals', (req, res) => {
  const { workerId, heartRate, spo2 } = req.body;
  if (!workerId) return res.status(400).json({ error: 'workerId required' });

  const existing = environmentDataByWorker[workerId] || { ...defaultEnv };
  environmentDataByWorker[workerId] = {
    ...existing,
    heartRate,
    spo2: spo2
  };

  // Broadcast to any clients in this worker's room
  io.to(workerId).emit('environmentUpdate', environmentDataByWorker[workerId]);
  console.log(`📡 Vitals updated for ${workerId}:`, environmentDataByWorker[workerId]);

  res.status(200).json({ message: 'Vitals updated.' });
});

app.use(
  '/cam',                           // ← LOCAL route path!
  createProxyMiddleware({
    target: 'http://192.168.192.155', // ← the *target*, not the mount point
    changeOrigin: true,
    secure: false,
    ws: true
  })
);
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('/*name', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
// --- Socket.IO for browser clients ---
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('joinRoom', (workerId) => {
    socket.join(workerId);
    const envData = environmentDataByWorker[workerId] || defaultEnv;
    socket.emit('environmentUpdate', envData);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- Separate WebSocket Server for ESP32 (raw ws) ---
const wss = new WebSocket.Server({ server, path: '/esp32' });

wss.on('connection', (ws) => {
  console.log('✅ ESP32 connected via raw WebSocket');

  ws.on('message', (message) => {
    const msgStr = message.toString();
    console.log('📨 Data from ESP32:', msgStr);

    try {
      const parsed = JSON.parse(msgStr);
      const workerId = parsed.workerId || "unknown";
    
      environmentDataByWorker[workerId] = parsed;
      io.to(workerId).emit('environmentUpdate', parsed);
    } catch (err) {
      console.error("❌ JSON Parse Error:", msgStr);
    }
    
  });

  ws.on('close', () => {
    console.log('❌ ESP32 disconnected');
  });
});

// --- Separate WebSocket Server for UWB tag (raw ws) ---
const wssUwb = new WebSocket.Server({ server, path: '/uwb' });

wssUwb.on('connection', ws => {
  console.log('✅ UWB tag connected via raw WebSocket (/uwb)');

  ws.on('message', (message) => {
    const msgStr = message.toString();
    console.log('📨 Data from UWB tag:', msgStr);

    try {
      const data = JSON.parse(msgStr);
      // data should be: { id, name, riskLevel, position: { x, y } }

      // Broadcast out to your IndoorMap clients
      io.emit('positionUpdate', data);
    } catch (err) {
      console.error('❌ Invalid JSON on /uwb:', msgStr);
    }
  });

  ws.on('close', () => {
    console.log('❌ UWB tag disconnected from /uwb');
  });
});


// // --- Separate WebSocket Server for DW1000 (raw ws) ---
// const dwwss = new WebSocket.Server({ port: DW1000_WS_PORT });

// dwwss.on('connection', (dwws) => {
//   console.log('✅ DW1000 connected via raw WebSocket');

//   dwws.on('message', (message) => {
//     const msgStr = message.toString();
//     console.log('📨 Data from DW1000:', msgStr);

//     try {
//       const parsed = JSON.parse(msgStr);
//       const workerId = parsed.workerId || "unknown";
    
//       environmentDataByWorker[workerId] = parsed;
//       io.to(workerId).emit('environmentUpdate', parsed);
//     } catch (err) {
//       console.error("❌ JSON Parse Error:", msgStr);
//     }
    
//   });

//   dwws.on('close', () => {
//     console.log('❌ DW1000 disconnected');
//   });
// });

// Start main HTTP + Socket.IO server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Start raw WebSocket server for ESP32 separately
console.log(`🔌 ESP32 WebSocket server running on port ${PORT}`);
// Replace with your ESP32’s RTSP URL

// const wssCam = new WebSocket.Server({server, path: '/camera-socket' });

// wssCam.on('connection', (ws) => {
//   console.log('✅ ESP32-S3 camera connected via raw WebSocket');

// server/server.js
// (inside the same server.listen scope)

// const wssCam = new WebSocket.Server({ server, path: '/camera-socket' });
// wssCam.on('connection', ws => {
//   console.log('📷 camera connected');
//   ws.on('message', data => io.emit('cameraFrame', data));
// });

// console.log('🔌 Camera WS at ws://localhost:3000/camera-socket');


//   ws.on('close', () => {
//     console.log('❌ ESP32-S3 camera disconnected');
//   });
// });

// console.log(`🔌 ESP32-S3 camera WebSocket server running on port ${PORT}`);

// const rtspUrl = 'rtsp://192.168.192.155:554/mjpeg/1';

// new Stream({
//   name: 'esp32',
//   streamUrl: 'rtsp://192.168.192.155:554/mjpeg/1',
//   wsPort: 9999,
//   ffmpegPath: 'C:\\ffmpeg\\ffmpeg-2025-05-01-git-707c04fe06-full_build\\bin\\ffmpeg.exe',  // ← full path to ffmpeg.exe
//   ffmpegOptions: {
//     '-stats': '',
//     '-r': 20
//   }
// });

// console.log('RTSP → WebSocket bridge running on ws://localhost:9999');


// console.log(`🔌 DW1000 WebSocket server running on port ${DW1000_WS_PORT}`);