const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");
const colors = require("colors");
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");

//Route  files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");

//Load env vars
dotenv.config({path: "./config/config.env"});

//connect to database
connectDB();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//file uploading
app.use(fileupload());

//static folder
app.use(express.static(path.join(__dirname, "public")));

//mount routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

//hanlde unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`.red);

	server.close(() => process.exit(1));
});
