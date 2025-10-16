const mongoose = require('mongoose');

const commonAuthFields = {
	username: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true,select: false },
	emailVerified: { type: Boolean, default: false },
	otpCode: { type: String },
	otpExpiresAt: { type: Date },
	resetToken: { type: String },
	resetTokenExpiresAt: { type: Date }
};

const UserSchema = new mongoose.Schema({
	...commonAuthFields,
	favSheikhs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sheikh' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);


