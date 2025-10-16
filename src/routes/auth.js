const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Sheikh = require('../models/Sheikh');
const { authRequired } = require('../middleware/auth');
const { sendEmail } = require('../services/mailer');
const { generateOtpCode, signAuthToken, setAuthCookie, hashPassword, verifyPassword } = require('../services/security');

const router = express.Router();

router.post('/register', async (req, res) => {
	try {
		const { role, username, email, password, otp } = req.body || {};
		if (!role || !['user', 'sheikh'].includes(role)){
			return res.status(400).json({
				 error: 'role must be chosen' 
			});
		}
		const Model = role === 'user' ? User : Sheikh;
		
		if (otp) {
			const account = await Model.findOne({ email });
			if (!account){ 
				return res.status(404).json({ error: 'Account not found' });
			}
			if (account.emailVerified) {
				return res.json({ ok: true, message: 'Already verified' });
			}
			if (!account.otpCode || !account.otpExpiresAt || account.otpExpiresAt < new Date()) {
				return res.status(400).json({ error: 'OTP expired, re-register' });
			}
			if (account.otpCode !== otp) {
				return res.status(400).json({ error: 'Invalid OTP' });
			}
			account.emailVerified = true;
			account.otpCode = undefined;
			account.otpExpiresAt = undefined;
			await account.save();
			return res.json({ ok: true });
		}

		if (!username || !email || !password) {
			return res.status(400).json({ 
				error: 'Missing fields' 
			});
		}
		const exists = (await User.findOne({ email, username })) || (await Sheikh.findOne({ email, username }));
		if (exists)  {
			return res.status(409).json({ error: 'Email or username already registered' });
		}
		
		const passwordHash = await hashPassword(password);
		const otpCode = generateOtpCode();
		const otpExpiresAt = new Date(Date.now() + process.env.OTP_TIME_OUT);
		await Model.create({ username, email, password: passwordHash, otpCode, otpExpiresAt });
		await sendEmail(email, 'Your OTP Code', `Your verification code is ${otpCode}. It expires in 15 minutes.`);
		return res.status(201).json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password, role } = req.body || {};
		if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
		const tryModels = role ? [role] : ['user', 'sheikh'];
		let account = null;
		let accountRole = null;
		for (const r of tryModels) {
			const Model = r === 'user' ? User : Sheikh;
			const found = await Model.findOne({ email });
			if (found) {
				account = found;
				accountRole = r;
				break;
			}
		}
		if (!account) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await verifyPassword(password, account.password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		if (!account.emailVerified) return res.status(403).json({ error: 'Email not verified' });
		const token = signAuthToken({ id: account._id.toString(), role: accountRole });
		setAuthCookie(res, token);
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.post('/forgetPassword', async (req, res) => {
	try {
		const { email, role } = req.body || {};
		if (!email) return res.status(400).json({ error: 'Missing email' });
		const tryModels = role ? [role] : ['user', 'sheikh'];
		let account = null;
		let Model = null;
		for (const r of tryModels) {
			const M = r === 'user' ? User : Sheikh;
			const found = await M.findOne({ email });
			if (found) { account = found; Model = M; break; }
		}
		if (!account) return res.json({ ok: true });
		const resetToken = crypto.randomBytes(24).toString('hex');
		account.resetToken = resetToken;
		account.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
		await account.save();
		await sendEmail(email, 'Password Reset', `Your reset token is ${resetToken}. It expires in 30 minutes.`);
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.post('/resetPassword', async (req, res) => {
	try {
		const { email, role, token, newPassword } = req.body || {};
		if (!email || !token || !newPassword) return res.status(400).json({ error: 'Missing fields' });
		const Model = role === 'sheikh' ? Sheikh : User;
		const account = await Model.findOne({ email });
		if (!account || !account.resetToken || !account.resetTokenExpiresAt) return res.status(400).json({ error: 'Invalid token' });
		if (account.resetToken !== token || account.resetTokenExpiresAt < new Date()) return res.status(400).json({ error: 'Invalid token' });
		account.password = await hashPassword(newPassword);
		account.resetToken = undefined;
		account.resetTokenExpiresAt = undefined;
		await account.save();
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;


