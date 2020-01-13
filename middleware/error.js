const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  //log for developer
  console.log(err.stack.red);

  //Mongoose bad ObjectID
  if (err.name === 'CastError') {
    const message = `Resource not found  with id of ${err.value}`
    error = new ErrorResponse(message, 404)
  }

  //Mongoose duplicate key
  if (error.code === 1100) {
    const message = `Duplicate field value`
    error = new ErrorResponse(message, 400)
  }

  //Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500)
    .json({
      success: false,
      error: error.message || 'Server Error'
    })

  next()
};


module.exports = errorHandler
