
require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");
const User = require("./models/User");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter your registered email: ", async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            console.log("User not found. Register this account first.");
        } else {
            user.role = "admin";
            await user.save();
            console.log("Admin account created successfully!");
        }
    } catch (error) {
        console.log("Error:", error.message);
    } finally {
        await mongoose.disconnect();
        rl.close();
    }
});
