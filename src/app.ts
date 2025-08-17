import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import adminRoute from "./routes/admin.js";
import Admin from "./models/admin.js";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalAdmin = await Admin.countDocuments();
    const adminName = process.env.ADMIN_NAME as string;
    const email = process.env.ADMIN_EMAIL as string;

    if (totalAdmin === 0) {
      const admin = new Admin({ adminName, email });
      await admin.save();
      console.log("Default admin created");
    }
    next();
  } catch (err) {
    console.error("Failed to create an admin", err);
    res.status(500).json({ message: "Server error while creating admin" });
  }
});

app.use(express.json());
app.use(cors());

app.use("/admin", adminRoute);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
