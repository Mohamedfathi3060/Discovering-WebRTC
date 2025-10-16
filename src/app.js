const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { connectDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const sheikhRoutes = require('./routes/sheikhs');
const favRoutes = require('./routes/favorites');

module.exports = function createApp() {
	connectDb();
	const app = express();
	app.use(express.json());
	app.use(cookieParser());
	app.use(express.static(path.resolve(__dirname, '..')));

	app.use(authRoutes);
	// TODO 
	//  add reqAuth Here once
	app.use(sheikhRoutes);
	app.use(favRoutes);

	return app;
};
