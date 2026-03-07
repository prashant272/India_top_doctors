const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");

        const Doctor = mongoose.model("Doctor", new mongoose.Schema({}, { strict: false }), "doctors");
        const activeDoctors = await Doctor.find({ isActive: true });

        console.log("Total Active doctors:", activeDoctors.length);
        if (activeDoctors.length > 0) {
            console.log("First Active Doctor Data:", JSON.stringify(activeDoctors[0], null, 2));
        } else {
            console.log("No active doctors found.");
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Debug Error:", err);
    }
}

debug();
