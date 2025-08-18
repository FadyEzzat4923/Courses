import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import ownerRoute from "./routes/owner.js";
import adminRoute from "./routes/admin.js";
import courseRoute from "./routes/course.js";
import instractorRoute from "./routes/instractor.js";
import studentRoute from "./routes/student.js";
import "dotenv/config";
import Owner from "./models/owner.js";

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalOwner = await Owner.countDocuments();
    const ownerName = process.env.OWNER_NAME as string;
    const email = process.env.OWNER_EMAIL as string;

    if (totalOwner === 0) {
      const owner = new Owner({ ownerName, email });
      await owner.save();
      console.log("Default Owner Created");
    }
    next();
  } catch (err) {
    console.error("Failed to create an owner", err);
    res.status(500).json({ message: "Server error while creating admin" });
  }
});

app.use(express.json());
app.use(cors());

app.use("/owner", ownerRoute);
app.use("/admin", adminRoute);
app.use("/course", courseRoute);
app.use("/instractor", instractorRoute);
app.use("/student", studentRoute);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
