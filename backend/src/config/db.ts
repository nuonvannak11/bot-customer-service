import mongoose from "mongoose";
import { get_env } from "../utils/util";

const connectDB = async () => {
    try {
        const uri = get_env("MONGO_URI");
        await mongoose.connect(uri, {
            autoIndex: true,      // Build indexes automatically
            maxPoolSize: 50,      // 🧩 Connection pool limit (50 connections)
            minPoolSize: 5,       // 🧩 Keep 5 idle connections ready
            serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB not reachable
            socketTimeoutMS: 45000,         // Close inactive sockets after 45s
        });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        process.exit(1);
    }
};

export default connectDB;
