const express = require('express');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/favShiekhs', authRequired, async (req, res) => {
	try {
		if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });
		const { sheikhId } = req.body || {};
		if (!sheikhId) return res.status(400).json({ error: 'Missing sheikhId' });
		await User.updateOne({ _id: req.auth.id }, { $addToSet: { favSheikhs: sheikhId } });
		return res.json({ ok: true });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.get('/favShiekhs', authRequired, async (req, res) => {
	try {
		if (req.auth.role !== 'user') return res.status(403).json({ error: 'Forbidden' });
		const user = await User.findById(req.auth.id).populate('favSheikhs', 'username email');
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ favSheikhs: user.favSheikhs || [] });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;


