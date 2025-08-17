/* eslint-disable @typescript-eslint/no-unused-vars */
import { connect } from "mongoose";
import "dotenv/config";

export async function connectDB() {
  const MONGO_URI: string = process.env.MONGO_URI as string;
  try {
    await connect(MONGO_URI);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("MongoDB connection failed!");
    process.exit(1);
  }
}
