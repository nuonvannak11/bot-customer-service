import mongoose from "mongoose";
import { get_env } from "../utils/util";

const connectDB = async () => {
    try {
        const uri = get_env("MONGO_URI");
        await mongoose.connect(uri, {
            autoIndex: true,
        });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;
