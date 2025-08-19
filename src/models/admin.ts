import { model, Schema, Document, Types } from "mongoose";

interface IAdmin extends Document {
  _id: Types.ObjectId;
  adminName: string;
  email: string;
  password: string;
  centerName: string;
  code?: number;
  code_expire_in?: Date;
  courses?: Types.ObjectId[];
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
    password: {
      type: String,
      required: true,
      trim: true,
    },
    centerName: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: Number,
    },
    code_expire_in: {
      type: Date,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IAdmin>("Admin", adminSchema);
