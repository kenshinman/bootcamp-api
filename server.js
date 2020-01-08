const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db")
//Route  files
const bootcamps = require("./routes/bootcamps")

//Load env vars
dotenv.config({ path: "./config/config.env" })

connectDB();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}
//mount routes
app.use("/api/v1/bootcamps", bootcamps)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))

//hanlde unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1))

})