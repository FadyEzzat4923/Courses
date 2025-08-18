import { Schema, model, Types } from "mongoose";

interface IInstractor {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  courses: Types.ObjectId[];
}

const instractorSchema = new Schema<IInstractor>(
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
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model<IInstractor>("Instractor", instractorSchema);
