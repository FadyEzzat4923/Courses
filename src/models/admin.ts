import { model, Schema, Document } from "mongoose";

interface IAdmin extends Document {
  adminName: string;
  email: string;
  code?: number;
  code_expire_in?: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    code: {
      type: Number,
    },
    code_expire_in: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IAdmin>("Admin", adminSchema);
