const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function generateOtpCode() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

function signAuthToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
	res.cookie('token', token, {
		httpOnly: true,
		secure: !!process.env.COOKIE_SECURE || process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000
	});
}

async function hashPassword(plain) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(plain, salt);
}

async function verifyPassword(plain, hashed) {
	return bcrypt.compare(plain, hashed);
}

module.exports = {
	generateOtpCode,
	signAuthToken,
	setAuthCookie,
	hashPassword,
	verifyPassword
};


