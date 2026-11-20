
const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");

// Place Order
router.post("/place", async (req, res) => {
    try {
        const { customerName, email, address } = req.body;

        if (!customerName || !email || !address) {
            return res.status(400).json({
                message: "Please fill all customer details"
            });
        }

        const cartItems = await Cart.find().populate("product");

        if (cartItems.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty"
            });
        }

        let totalAmount = 0;
        const products = [];

        for (const item of cartItems) {
            if (!item.product) {
                return res.status(400).json({
                    message: "A cart product is unavailable"
                });
            }

            totalAmount += item.product.price * item.quantity;

            products.push({
                product: item.product._id,
                quantity: item.quantity
            });
        }

        const order = await Order.create({
            products,
            totalAmount,
            customerName,
            email: email.toLowerCase(),
            address
        });

        await Cart.deleteMany({});

        res.status(201).json({
            message: "Order placed successfully!",
            order
        });

    } catch (error) {
        console.log("Order Error:", error);

        res.status(500).json({
            message: "Unable to place order",
            error: error.message
        });
    }
});

// Track orders using customer email
router.get("/track/:email", async (req, res) => {
    try {
        const email = req.params.email.toLowerCase();

        const orders = await Order.find({ email })
            .populate("products.product")
            .sort({ createdAt: -1 });

        if (orders.length === 0) {
            return res.status(404).json({
                message: "No orders found"
            });
        }

        res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to track orders",
            error: error.message
        });
    }
});

// Get all orders
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("products.product");

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Unable to fetch orders",
            error: error.message
        });
    }
});

module.exports = router;
