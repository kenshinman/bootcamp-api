const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/Bootcamp");
const geocoder = require("../utils/geocoder");

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;

	//copy of req.query
	const reqQuery = { ...req.query }

	//fields to exclude
	const removeFields = ['select', 'sort', 'limit', 'page', 'skip']

	//loop over removeFields so you from reqQuery
	removeFields.forEach(param => delete reqQuery[param]);

	//query string
	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
	console.log({ queryStr })

	query = Bootcamp.find(JSON.parse(queryStr)).populate("courses")

	// if select field is included in params
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ")
		query.select(fields)
	}

	//if sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query.sort(sortBy)
	} else {
		query = query.sort("-createdAt")
	}

	//pagination
	const page = parseInt(req.query.page, 10) || 1
	const limit = parseInt(req.query.limit, 10) || 10
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit
	total = await Bootcamp.countDocuments()

	query = query.skip(startIndex).limit(limit);

	const bootcamps = await query;

	//pagination result
	const pagination = {}

	if (endIndex < total)
		pagination.next = {
			page: page + 1,
			limit
		}

	if (startIndex > 0)
		pagination.prev = {
			page: page - 1,
			limit
		}

	res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
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
	res.status(200).json({ success: true, data: bootcamp });
});

//@desc Create  bootcamp
//@route POST /api/v1/bootcamps
//@access private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

//@desc Update  bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!bootcamp) {
		return next(
			new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
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

	bootcamp.remove()

	res.status(200).json({ success: true, data: null });
});

//@desc get bootcamps within a radius
//@route GET /api/v1/bootcamps/radius/:zipcode/:distance (in miles)
//@access private
exports.getBootcampRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	//get long and lat
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	//calculate radius using radians
	//Divide distance by radius of the earth which is 3963 miles (6378km)
	const radius = distance / 3963; //for km
	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: { $centerSphere: [[lng, lat], radius] },
		},
	});
	console.log({ lng, lat, radius, bootcamps });

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});

	// res.status(200).json({ success: true, data: null });
});
