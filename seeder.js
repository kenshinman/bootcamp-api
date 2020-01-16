const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const colors = require("colors");

//Load env Vards
dotenv.config({ path: "./config/config.env" });

//Load models
const Bootcamp = require("./models/Bootcamp");

//connect db
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false,
});

//read file
const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

//import into db

const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
    console.log("Data imported".green.inverse);
    process.exit(1)
	} catch (error) {
    console.error(error);
    process.exit(1)
	}
};

//delete into db
const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
    console.log("Data destroyed".red);
    process.exit(1)
	} catch (error) {
    console.error(error);
    process.exit(1)
	}
};

if (process.argv[2] === "-i") {
	importData();
} else if (process.argv[2] === "-d") {
	deleteData();
}
