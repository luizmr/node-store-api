const Product = require('../models/product');

const getAllProductsStatic = async (req, res) => {
	const search = 'a';
	// $regex - name contains search string
	// $options - 'i' = case insensitive
	const products = await Product.find({
		name: { $regex: search, $options: 'i' },
	});
	res.status(200).json({ products, amount: products.length });
};

const getAllProducts = async (req, res) => {
	const { featured, company, name, sort, fields, numericFilters } = req.query;
	const queryObject = {};

	// sort -> ?sort=name (a to z) or ?sort=-name (z to a)
	// two or more sorts -> ?sort=name,-price for ex

	// fields -> ?fields=name,price -> brings only on json name and price fields

	// numericFilters => ?numericFilters=price>40,rating>=4

	if (featured) {
		queryObject.featured = featured === 'true' ? true : false;
	}

	if (company) {
		queryObject.company = company;
	}

	if (name) {
		queryObject.name = { $regex: name, $options: 'i' };
	}

	if (numericFilters) {
		const operatorMap = {
			'>': '$gt',
			'>=': '$gte',
			'=': '$eq',
			'<': '$lt',
			'<=': '$lte',
		};

		const regEx = /\b(<|>|>=|<=|=)\b/g;
		let filters = numericFilters.replace(
			regEx,
			(match) => `-${operatorMap[match]}-`,
		);
		// returns price-$gt-40,rating-$gte-4 for ex
		const options = ['price', 'rating'];

		filters = filters.split(',').forEach((item) => {
			const [field, operator, value] = item.split('-');
			if (queryObject[field]) {
				const queryField = queryObject[field];
				if (options.includes(field)) {
					queryObject[field] = {
						...queryField,
						[operator]: Number(value),
					};
				}
			} else {
				if (options.includes(field)) {
					queryObject[field] = { [operator]: Number(value) };
				}
			}
		});
	}

	let result = Product.find(queryObject);
	if (sort) {
		const sortList = sort.split(',').join(' ');
		result = result.sort(sortList);
	} else {
		result = result.sort('createdAt');
	}

	if (fields) {
		const fieldList = fields.split(',').join(' ');
		result = result.select(fieldList);
	}

	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * limit;

	result = result.skip(skip).limit(limit);

	const products = await result;
	res.status(200).json({ products, amount: products.length });
};

module.exports = {
	getAllProducts,
	getAllProductsStatic,
};
