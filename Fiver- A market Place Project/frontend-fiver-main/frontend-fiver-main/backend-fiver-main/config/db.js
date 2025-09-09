import mongoose  from "mongoose";
import dotenv from "dotenv";

const connectDB = async ()=>{

    try {
        await mongoose.connect(process.env.MONGO)
        console.log("Database Connected")
    } catch (error) {
        console.log("Db error",error)
    }
}

export default connectDB
