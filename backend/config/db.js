const { default: mongoose } = require("mongoose");

exports.connectdb = async()=>{
    try {
        const connected =await mongoose.connect(process.env.MONGO_URL)
        if(connected){
            console.log("mongo is connected");
        }
    } catch (error) {
        console.log(error);
    }
}