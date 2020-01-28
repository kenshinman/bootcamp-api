const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

//@desc Register user
//@route POST /api/v1/auth/register
//@access public
exports.register = asyncHandler(async (req, res, next) => {
	const {name, email, password, role} = req.body;

	//create  user
	const user = await User.create({
		name,
		email,
		password,
		role
	});

	sendTokenResponse(user, 200, res);
});

//@desc Login user
//@route POST /api/v1/auth/login
//@access public
exports.login = asyncHandler(async (req, res, next) => {
	const {email, password} = req.body;

	//validate email and password
	if (!email || !password) {
		return next(new ErrorResponse(`Please provide an email and password`, 400));
	}

	//check for user
	const user = await User.findOne({email}).select("+password");

	if (!user) {
		return next(new ErrorResponse(`Invalid credentials`, 401));
	}

	//check if password matches
	const isMatch = await user.matchPasswords(password);
	if (!isMatch) {
		return next(new ErrorResponse(`Invalid credentials`, 401));
	}

	//create token from the static method  added  to the User model
	const token = await user.getSignedJwtToken();

	sendTokenResponse(user, 200, res);
});

//@desc Getcurrent  logged  in user
//@route POST /api/v1/auth/me
//@access private
exports.getMe = asyncHandler(async (req, res, next) => {
	console.log("req.user=>", req.user);
	const user = await User.findById(req.user);
	console.log({user});
	res.status(200).json({success: true, data: user});
});

//@descLogout/ Clear cookie
//@route GET /api/v1/auth/logout
//@access private
exports.logout = asyncHandler(async (req, res, next) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true
	});
	res.status(200).json({success: true, data: {}});
});

//@desc Forgot Password
//@route POST /api/v1/auth/forgotpassword
//@access private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({email: req.body.email});

	if (!user) {
		return next(new ErrorResponse(`There is no user  with that email`, 404));
	}

	//Geset Token
	const resetToken = user.getResetPasswordToken();

	await user.save({
		validateBeforeSave: false
	});

	//create reset URL
	const resetUrl = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are ceiving this email because you requested a password reset. Please make a PUT request to:\n\n ${resetUrl} \n\nto reset your password.`;

	try {
		await sendEmail({
			email: user.email,
			subject: "Password Reset",
			message
		});

		res.status(200).json({
			success: true,
			data: user
		});
	} catch (error) {
		console.log(error);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		user.save({
			validateBeforeSave: false
		});

		return next(new ErrorResponse(`Password could not be reset`, 500));
	}
});

//@desc Forgot Password
//@route PUT /api/v1/auth/resetpassword/:resettoken
//@access private
exports.resetPassword = asyncHandler(async (req, res, next) => {
	//get token out of the route
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.resettoken)
		.digest("hex");

	//get user with the token
	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: {$gt: Date.now()}
	});

	if (!user) {
		return next(new ErrorResponse(`Invalid User`, 400));
	}

	//set new password
	user.password = req.body.password;
	user.resetPasswordExpire = undefined;
	user.resetPasswordToken = undefined;

	await user.save();

	sendTokenResponse(user, 200, res);
});

//@desc Update user creedntials
//@route PUT /api/v1/auth/updatecredentials
//@access private
exports.updateDetails = asyncHandler(async (req, res, next) => {
	const {email, name} = req.body;
	const fieldsToUpdate = {name, email};

	const user = await User.findOneAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true
	});
	res.status(200).json({success: true, data: user});
});

//@desc Update user password
//@route PUT /api/v1/auth/updatepassword
//@access private
exports.updatePassword = asyncHandler(async (req, res, next) => {
	console.log(req.user);
	const {currentPassword, newPassword} = req.body;
	if (!currentPassword || !newPassword) {
		next(
			new ErrorResponse(`Please enter both a newPassword and  currentPassword`)
		);
	}
	const user = await User.findById(req.user.id).select("+password");

	//check current password
	if (!(await user.matchPasswords(currentPassword))) {
		return next(new ErrorResponse(`Password is incorrect`, 400));
	}

	user.password = newPassword;
	user.save();
	sendTokenResponse(user, 200, res);
});

//get  token from model, create cookie and send  response
const sendTokenResponse = async (user, statusCode, res) => {
	//create token
	//create token from the static method  added  to the User model
	const token = await user.getSignedJwtToken();

	//cookie options
	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true
	};

	if (process.env.NODE_ENV === "production") {
		options.secure = true;
	}
	res
		.status(statusCode)
		.cookie("token", token, options)
		.json({success: true, token, data: user});
};
