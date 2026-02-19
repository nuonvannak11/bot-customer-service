import mongoose from "mongoose";

export interface IPhoneVerify extends mongoose.Document {
  phone: string;
  code: string;
  expiresAt: Date;
  tempData?: {
    name: string;
    passwordHash: string;
  };
}

const phoneVerifySchema = new mongoose.Schema<IPhoneVerify>({
  phone: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  tempData: {
    name: String,
    passwordHash: String,
  },
});

export default mongoose.model<IPhoneVerify>("PhoneVerify", phoneVerifySchema);
