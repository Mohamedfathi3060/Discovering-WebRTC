const onlineUsers = new Map();
const onlineSheikhs = new Map();

function markOnline(role, id) {
	const now = Date.now();
	if (role === 'user') onlineUsers.set(id, { lastSeenAt: now });
	if (role === 'sheikh') onlineSheikhs.set(id, { lastSeenAt: now });
}

function markOffline(role, id) {
	if (role === 'user') onlineUsers.delete(id);
	if (role === 'sheikh') onlineSheikhs.delete(id);
}

module.exports = { onlineUsers, onlineSheikhs, markOnline, markOffline };


