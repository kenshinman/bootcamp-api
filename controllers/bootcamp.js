const Bootcamp = require('../models/Bootcamp');

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find({});
    const count = await Bootcamp.count();
    res.status(200).json({ success: true, count, data: bootcamps });
  } catch (error) {
    res.status(400).json({ success: false });
  }
  next();
};

//@desc Get single bootcamp
//@route GET /api/v1/bootcamps/:id
//@access public
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    // res.status(400).json({ success: false, error });
    next(error)
  }
  next();
};

//@desc Create  bootcamp
//@route POST /api/v1/bootcamps
//@access private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({ success: false });
  }
  next();
};

//@desc Update  bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bootcamp) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ success: false });
  }
  next();
};

//@desc Update  bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndRemove(req.params.id);

    res.status(200).json({ success: true, data: null });
  } catch (error) {
    res.status(400).json({ success: false });
  }
  next();
};
