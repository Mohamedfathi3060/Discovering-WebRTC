const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

async function authRequired(req, res, next) {
	try {
		const token = req.cookies && req.cookies.token;
		if (!token) return res.status(401).json({ error: 'Unauthorized' });
		const decoded = jwt.verify(token, JWT_SECRET);
		req.auth = decoded; // { id, role }
		next();
	} catch (e) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

module.exports = { authRequired };


