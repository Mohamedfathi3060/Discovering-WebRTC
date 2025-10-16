const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

// rooms map: roomName -> Set of ws clients
const rooms = new Map();

function attachWebSocket(server) {
	const wss = new WebSocket.Server({ server });

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
				ws.send(JSON.stringify({ type: 'joined', peersIDs, asingnedId: ws.ID }));
			} else if (room && rooms.has(room)) {
				const set = rooms.get(room);
				for (const client of set) {
					if (client.ID === data.target && client.readyState === WebSocket.OPEN) {
						client.send(JSON.stringify(data));
						break;
					}
				}
			}
		});

		ws.on('close', () => {
			if (ws.room && rooms.has(ws.room)) {
				rooms.get(ws.room).delete(ws);
				for (const client of rooms.get(ws.room)) {
					if (client.readyState === WebSocket.OPEN)
						client.send(JSON.stringify({ type: 'leave', source: ws.ID }));
				}
				if (rooms.get(ws.room).size === 0) rooms.delete(ws.room);
			}
		});
	});
}

module.exports = { attachWebSocket };


