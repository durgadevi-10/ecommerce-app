
const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

const updateImage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const product = await Product.findOneAndUpdate(
            { name: "Wireless Headphones" },
            {
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
            },
            { new: true }
        );

        if (product) {
            console.log("Product Image Updated Successfully!");
        } else {
            console.log("Product Not Found!");
        }

    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

updateImage();
