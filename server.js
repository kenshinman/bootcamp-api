const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");
const path = require("path");
const helmet = require("helmet");
const xss = require("xss-clean");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const mongoSanitize = require("express-mongo-sanitize");

//Route  files
const auth = require("./routes/auth");
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

//Load env vars
dotenv.config({path: "./config/config.env"});

//connect to database
connectDB();

//body parser
const app = express();

//body parser
app.use(express.json());

//cookie parser
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//file uploading
app.use(fileupload());

//sanitize requests
app.use(mongoSanitize());
//set secure headers
app.use(helmet());
//prevent cross site scripting
app.use(xss());

//static folder
app.use(express.static(path.join(__dirname, "public")));

//mount routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

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
