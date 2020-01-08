const errorHandler = (err, req, res, next) => {
  //log for developer
  console.log(err.stack.red);

  res.status(500).json({ success: false, error: err.message })

  next()
};


module.exports = errorHandler
