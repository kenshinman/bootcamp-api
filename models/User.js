const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

module.exports = mongoose.model("User", UserSchema);