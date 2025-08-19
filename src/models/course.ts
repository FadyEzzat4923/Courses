import { Schema, Types, model } from "mongoose";

interface ICourse {
  title: string;
  description: string;
  price: number;
  startDate: Date;
  endDate: Date;
  appointment: Date[];
  students?: Types.ObjectId[];
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    appointment: [{ type: Date, required: true }],
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<ICourse>("Course", courseSchema);
