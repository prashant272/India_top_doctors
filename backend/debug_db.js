const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const Doctor = require('./models/Doctor');

async function checkDoctors() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");
        const count = await Doctor.countDocuments();
        console.log(`Total doctors: ${count}`);
        const activeCount = await Doctor.countDocuments({ isActive: true });
        console.log(`Active doctors: ${activeCount}`);
        const doctors = await Doctor.find().limit(5).select('basicInfo.fullName basicInfo.email isActive');
        console.log("Sample doctors:", JSON.stringify(doctors, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDoctors();
