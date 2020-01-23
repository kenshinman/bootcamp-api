const advancedResult = (model, populate) => async (req, res, next) => {
	let query;

	//copy of req.query
	const reqQuery = {...req.query};

	//fields to exclude
	const removeFields = ["select", "sort", "limit", "page", "skip"];

	//loop over removeFields so you from reqQuery
	removeFields.forEach((param) => delete reqQuery[param]);

	//query string
	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
	console.log({queryStr});

	query = model.find(JSON.parse(queryStr));

	if (populate) {
		query = query.populate(populate);
	}

	// if select field is included in params
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query.select(fields);
	}

	//if sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query.sort(sortBy);
	} else {
		query = query.sort("-createdAt");
	}

	//pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 10;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	const results = await query;

	//pagination result
	const pagination = {};

	if (endIndex < total)
		pagination.next = {
			page: page + 1,
			limit
		};

	if (startIndex > 0)
		pagination.prev = {
			page: page - 1,
			limit
		};

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results
	};

	next();
};

module.exports = advancedResult;
