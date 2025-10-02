const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// serve static files from current directory
app.use(express.static(path.resolve(__dirname)));

// rooms map: roomName -> Set of ws clients
const rooms = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data = null;
    try {
      data = JSON.parse(msg.toString());
    } catch (e) {
      return;
    }
    const { type, room } = data;

    if (type === 'join') {
      ws.room = room;
      if (!rooms.has(room)) rooms.set(room, new Set());
      rooms.get(room).add(ws);
      // send joined + count
      const peers = Array.from(rooms.get(room)).length - 1; // others
      ws.send(JSON.stringify({ type: 'joined', peers }));
    } else if (room && rooms.has(room)) {
      // forward signaling messages to other peers in the same room
      const set = rooms.get(room);
      for (const client of set) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          // forward offer/answer/candidate/hangup/reject
          client.send(JSON.stringify(data));
        }
      }

      // cleanup if hangup or leave
      if (type === 'hangup' || type === 'leave' || type === 'reject') {
        // optionally remove ws from room
      }
    }
  });

  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
      // notify remaining peers
      for (const client of rooms.get(ws.room)) {
        if (client.readyState === WebSocket.OPEN)
          client.send(JSON.stringify({ type: 'leave' }));
      }
      if (rooms.get(ws.room).size === 0) rooms.delete(ws.room);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));
