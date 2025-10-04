const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
      ws.ID = uuidv4();
      if (!rooms.has(room)) rooms.set(room, new Set());

      const peersIDs = Array.from(rooms.get(room), (ws) => ws.ID);

      rooms.get(room).add(ws);
      // send joined + count
      ws.send(JSON.stringify({ type: 'joined', peersIDs, asingnedId: ws.ID }));
    } else if (room && rooms.has(room)) {
      // forward signaling messages to other peers in the same room
      const set = rooms.get(room);
      for (const client of set) {
        if (client.ID === data.target && client.readyState === WebSocket.OPEN) {
          // forward to target offer/answer/candidate
          client.send(JSON.stringify(data));
          break;
        }
      }
    }
  });

  ws.on('close', () => {
    if (ws.room && rooms.has(ws.room)) {
      rooms.get(ws.room).delete(ws);
      // notify remaining peers
      for (const client of rooms.get(ws.room)) {
        if (client.readyState === WebSocket.OPEN)
          client.send(JSON.stringify({ type: 'leave', source: ws.ID }));
      }
      if (rooms.get(ws.room).size === 0) rooms.delete(ws.room);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server listening on', PORT));

/*
 TODO remove the  Accept/Reject options

 -> first one joined to Room X
 will not make any connections(Offer)

 -> Everyone joined after Joined Room X After the First one WILL
  recieve all Room X members (IDs)
  create connection for each member(ID) Except Me
  create Offer for each Member(ID)
  "AUTO" All offers Will be Accepted

-> for each Member in Room X recieved the Joiner's Offer
  will create him a special Connection & Answer

  So Web Service Must keep {ID -> ws} pairs to easily send Specific Messages "not Always broadcast"
*/
