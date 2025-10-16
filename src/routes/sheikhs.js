const express = require('express');
const Sheikh = require('../models/Sheikh');

const router = express.Router();

router.get('/searchSheikhs', async (req, res) => {
	try {
		const { username } = req.query;
		const q = username ? { username: { $regex: String(username), $options: 'i' } } : {};
		const list = await Sheikh.find(q).select('username email');
		return res.json({ sheikhs: list });
	} catch (e) {
		return res.status(500).json({ error: 'Server error' });
	}
});

module.exports = router;


