const express = require("express");
const {
	getBootcamp,
	getBootcamps,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampRadius,
	bootcampPhotoUpload
} = require("../controllers/bootcamp");

//advanced results
const advancedResults = require("../middleware/advancedResults");
const Bootcamp = require("../models/Bootcamp");

//include other resource router
const courseRouter = require("./courses");

const router = express.Router();

//Re-route  into other resource router
router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampRadius);

router
	.route("/")
	.get(advancedResults(Bootcamp, "courses"), getBootcamps)
	.post(createBootcamp);
router
	.route("/:id")
	.get(getBootcamp)
	.put(updateBootcamp)
	.delete(deleteBootcamp);

router.route("/:id/photo").put(bootcampPhotoUpload);

module.exports = router;
