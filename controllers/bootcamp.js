//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ msg: "Get all bootcamps" });
  next()
}

//@desc Get single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({ msg: "Get single bootcamp" });
  next()
}

//@desc Create  bootcamp
//@route POST /api/v1/bootcamps
//@access private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ msg: "Created Bootcamp" });
  next()
}