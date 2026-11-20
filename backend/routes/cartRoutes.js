
const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Test cart route
router.get("/test", (req, res) => {
    res.json({
        message: "Cart route working!"
    });
});

// Get all cart items
router.get("/", async (req, res) => {
    try {
        const cartItems = await Cart.find().populate("product");

        res.status(200).json(cartItems);
    } catch (error) {
        console.log("Get Cart Error:", error);

        res.status(500).json({
            message: "Error fetching cart",
            error: error.message
        });
    }
});

// Add product to cart
router.post("/add", async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const amount = Math.max(1, Number(quantity) || 1);

        let cartItem = await Cart.findOne({
            product: productId
        });

        if (cartItem) {
            cartItem.quantity += amount;
            await cartItem.save();
        } else {
            cartItem = await Cart.create({
                product: productId,
                quantity: amount
            });
        }

        res.status(201).json({
            message: "Product added to cart",
            cartItem
        });

    } catch (error) {
        console.log("Add Cart Error:", error);

        res.status(500).json({
            message: "Error adding product",
            error: error.message
        });
    }
});

// Remove product from cart
router.delete("/:id", async (req, res) => {
    try {
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        res.status(200).json({
            message: "Product removed from cart"
        });

    } catch (error) {
        console.log("Remove Cart Error:", error);

        res.status(500).json({
            message: "Error removing product",
            error: error.message
        });
    }
});

module.exports = router;
