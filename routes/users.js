const express = require("express");
const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");
const {protect, authorize} = require("../middleware/auth");

const router = express.Router();

const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser
} = require("../controllers/user");

router.use(protect, authorize("admin"));

router
	.route("/")
	.get(advancedResults(User), getUsers)
	.post(createUser);
router
	.route("/:id")
	.get(getUser)
	.put(updateUser)
	.delete(deleteUser);

module.exports = router;
