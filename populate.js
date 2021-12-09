require('dotenv').config();

const connectDB = require('./db/connect');
const Product = require('./models/product');

const products = require('./products.json');

const start = async () => {
	try {
		await connectDB(process.env.MONGO_URI);
		await Product.deleteMany();
		await Product.create(products);
		// 0 success
		process.exit(0);
	} catch (error) {
		console.log(error);
		// 1 error
		process.exit(1);
	}
};

start();
