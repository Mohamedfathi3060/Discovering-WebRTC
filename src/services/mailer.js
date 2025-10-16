const nodemailer = require('nodemailer');

const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@example.com';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const mailer = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: SMTP_PORT === 465,
	auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
});

async function sendEmail(to, subject, text) {
	if (!SMTP_USER || !SMTP_PASS) return;
	await mailer.sendMail({ from: EMAIL_FROM, to, subject, text });
}

module.exports = { sendEmail };


