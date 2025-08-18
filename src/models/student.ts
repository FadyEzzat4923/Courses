import { Schema, model, Types } from "mongoose";

interface IStudent {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  courses: {
    courseId: Types.ObjectId;
    courseAttendance: number;
  }[];
}

const studentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    whatsapp: {
      type: String,
      required: true,
    },
    courses: [
      {
        courseId: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          required: true,
        },
        courseAttendance: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IStudent>("Student", studentSchema);
