const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

//@desc Get all courses
//@route GET /api/v1/courses
//@route GET /api/v1/courses/:bootcampId/courses
//@access public

exports.getCourses = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const courses = Course.find({bootcamp: req.params.bootcampId});

		return res.status(200).json({
			success: true,
			count: (await courses).length,
			data: courses
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

//@desc Get a single course
//@route GET /api/v1/courses/:id
//@access public

exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await (await Course.findById(req.params.id)).populate({
		path: "bootcamp",
		select: "name description"
	});

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		success: true,
		data: course
	});
});

//@desc Add a single course
//@route POST /api/v1/bootcamps/:bootcampId/courses
//@access private

exports.addCourse = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
			404
		);
	}

	//make sure only bootcamp owner can  update  bootcamp
	if (req.user.id !== bootcamp.user.toString() && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`You don not have permission to add a course to this bootcamp`,
				401
			)
		);
	}

	const course = await Course.create(req.body);

	res.status(200).json({
		success: true,
		data: course
	});
});

//@desc Update course
//@route POST /api/v1/courses/:id
//@access private

exports.updateCourse = asyncHandler(async (req, res, next) => {
	let course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	//make sure only bootcamp owner can  update  bootcamp
	if (req.user.id !== course.user.toString() && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`You don not have permission to update this course`,
				401
			)
		);
	}

	course = await Course.findByIdAndUpdate(course, req.body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		success: true,
		data: course
	});
});

//@desc Delete course
//@route DELETE /api/v1/courses/:id
//@access private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	//make sure only bootcamp owner can  update  bootcamp
	if (req.user.id !== course.user.toString() && req.user.role !== "admin") {
		return next(
			new ErrorResponse(
				`You don not have permission to update this course`,
				401
			)
		);
	}

	await course.remove();

	res.status(200).json({
		success: true,
		data: {}
	});
});
