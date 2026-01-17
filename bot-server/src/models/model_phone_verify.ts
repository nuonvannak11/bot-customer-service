import mongoose from "mongoose";

const phoneVerifySchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  tempData: {
    name: String,
    passwordHash: String,
  },
});

export default mongoose.model("PhoneVerify", phoneVerifySchema);
