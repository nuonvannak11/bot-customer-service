import mongoose from "mongoose";
import { get_env } from "../utils/get_env";
import { eLog } from "../libs/lib";

const connectDB = async () => {
    try {
        const uri = get_env("MONGO_URI");
        await mongoose.connect(uri, {
            autoIndex: true,
            maxPoolSize: 50,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        eLog('✅ Connected to MongoDB!');
    } catch (err) {
        eLog('❌ MongoDB Error:', err);
        process.exit(1);
    }
};

export default connectDB;
