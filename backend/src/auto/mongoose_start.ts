import mongoose from "mongoose";
import { IpManager } from "../middleware/ip_manager";
import { eLog } from "../libs/lib";

const handler = async () => {
    try {
        await IpManager.init();
        eLog("✅ IP Manager initialized");
    } catch (err) {
        eLog("❌ Failed to initialize IP Manager:", err);
    }
};

if (mongoose.connection.readyState === 1) {
    handler();
} else {
    mongoose.connection.once("open", handler);
    mongoose.connection.once("error", (err) => {
        eLog("MongoDB connection error:", err);
    });
}
