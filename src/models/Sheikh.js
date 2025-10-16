const mongoose = require('mongoose');

const commonAuthFields = {
	username: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, select: false },
	emailVerified: { type: Boolean, default: false },
	otpCode: { type: String },
	otpExpiresAt: { type: Date },
	resetToken: { type: String },
	resetTokenExpiresAt: { type: Date }
};

const SheikhSchema = new mongoose.Schema({
	...commonAuthFields
}, { timestamps: true });

module.exports = mongoose.model('Sheikh', SheikhSchema);


