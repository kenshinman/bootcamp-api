const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

//@desc Get single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({success: true, data: bootcamp});
});

//@desc Create  bootcamp
//@route POST /api/v1/bootcamps
//@access private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	//add req.user to req.body
	req.body.user = req.user.id;

	//check for publidhed  user
	const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

	//if  user is not an admin, he can't add  more than one bootcamp
	if (publishedBootcamp && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`The user with ID ${req.user.id} has already publidhed a bootcamp`,
				403
			)
		);
	}

	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp
	});
});

//@desc Update  bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({success: true, data: bootcamp});
});

//@desc Update  bootcamp
//@route DELETE /api/v1/bootcamps/:id
//@access private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}

	bootcamp.remove();

	res.status(200).json({success: true, data: null});
});

//@desc get bootcamps within a radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance (in miles)
//@access private
exports.getBootcampRadius = asyncHandler(async (req, res, next) => {
	const {zipcode, distance} = req.params;

	//get long and lat
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	//calculate radius using radians
	//Divide distance by radius of the earth which is 3963 miles (6378km)
	const radius = distance / 3963; //for km
	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: {$centerSphere: [[lng, lat], radius]}
		}
	});
	console.log({lng, lat, radius, bootcamps});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps
	});

	// res.status(200).json({ success: true, data: null });
});

//@desc Upload bootcamp photo
//@route DELETE /api/v1/bootcamps/:id/photo
//@access private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	if (!req.files) {
		return next(new ErrorResponse(`Please upload a file`, 404));
	}
	const file = req.files.file;

	console.log({file});

	//make sure image is a photo
	if (!file.mimetype.startsWith("image")) {
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	//check for file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
				400
			)
		);
	}

	//create custom file name
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.log(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name});

		res.status(200).json({
			success: true,
			data: file.name
		});
	});
});
