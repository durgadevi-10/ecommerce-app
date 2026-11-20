
const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const addProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const product = new Product({
            name: "Wireless Headphones",
            description: "High quality wireless headphones",
            price: 1499,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            category: "Electronics",
            stock: 20
        });

        await product.save();

        console.log("Product Added Successfully!");

    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

addProduct();
