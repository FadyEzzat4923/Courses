import { model, Schema, Document, Types } from "mongoose";

interface IOwner extends Document {
  _id: Types.ObjectId;
  ownerName: string;
  email: string;
  verifiedAdmin?: Types.ObjectId[];
  code?: number;
  code_expire_in?: Date;
}

const ownerSchema = new Schema<IOwner>(
  {
    ownerName: {
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
    verifiedAdmin: [
      {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],
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

export default model<IOwner>("Owner", ownerSchema);
