const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Review");
const Bootcamp = require("../models/Bootcamp");

//@desc Get all reviews
//@route GET /api/v1/courses
//@route GET /api/v1/reviews/:bootcampId/reviews
//@access public

exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({bootcamp: req.params.bootcampId});

		return res.status(200).json({
			success: true,
			count: await reviews.length,
			data: reviews
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

//@desc Get a single review
//@route GET /api/v1/review/:id
//@access public
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id).populate({
		path: "bootcamp",
		select: "name description"
	});

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		success: true,
		data: review
	});
});

//@desc create a review
//@route POST /api/v1/bootcamps/:bootcampId/reviews
//@access private
exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	//check if  bootcamp exists before adding review for bootcamp
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp with id ${req.params.bootcampId} not found`,
				404
			)
		);
	}

	const review = await Review.create(req.body);

	res.status(200).json({
		success: true,
		data: review
	});
});

//@desc update a review
//@route PUT /api/v1/reviews/:id
//@access private
exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	//check if  bootcamp exists before adding review for bootcamp
	if (!review) {
		return next(
			new ErrorResponse(`Review with id ${req.params.id} not found`, 404)
		);
	}
	//only allow creator of review or admin can update review
	if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
		if (!review) {
			return next(
				new ErrorResponse(`Not authorized to update this review`, 401)
			);
		}
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		success: true,
		data: review
	});
});

//@desc update a review
//@route DELETE /api/v1/reviews/:id
//@access private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	//check if  bootcamp exists before adding review for bootcamp
	if (!review) {
		return next(
			new ErrorResponse(`Review with id ${req.params.id} not found`, 404)
		);
	}
	//only allow creator of review or admin can update review
	if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
		if (!review) {
			return next(
				new ErrorResponse(`Not authorized to update this review`, 401)
			);
		}
	}

	await Review.findByIdAndDelete(req.params.id);

	res.status(200).json({
		success: true,
		data: {}
	});
});
