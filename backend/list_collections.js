const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        await mongoose.disconnect();
    } catch (err) {
        console.error("Debug Error:", err);
    }
}

debug();
