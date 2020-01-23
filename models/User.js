const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"]
	},
	email: {
		type: String,
		required: [true, "Please add an email"],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please add a valid email"
		]
	},
	role: {
		type: String,
		enum: ["user", "publisher"],
		default: "user"
	},
	password: {
		type: String,
		required: [true, "Please enter password."],
		minlength: 6,
		select: false
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
});

//encryot password using bcrypt
UserSchema.pre("save", async function(next) {
	//generate a salt
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

//Sign JWT and return
//these methods here  can be used on any instance of  this User  modele
//e.g. in `controllers/auth.js before` sending the user payload back
UserSchema.methods.getSignedJwtToken = function() {
	return jwt.sign(
		{
			id: this._id
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_EXPIRE
		}
	);
};

UserSchema.methods.matchPasswords = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
