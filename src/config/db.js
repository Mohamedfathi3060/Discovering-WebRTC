const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Iqraa_App';

function connectDb() {
	mongoose.connect(MONGO_URI, { autoIndex: true }).catch(() => {});
}

module.exports = { connectDb };


