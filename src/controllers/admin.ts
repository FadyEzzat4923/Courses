import { Request, Response } from "express";
import Admin from "../models/admin.js";
import { sendEmail } from "../config/sendEmail.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

function generateVerificationCode(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

export async function getVerificationCode(req: Request, res: Response) {
  const email = process.env.ADMIN_EMAIL as string;
  const code = generateVerificationCode();

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await sendEmail(
      "Admin Verification Code",
      `<h1>Your code is: ${code}</h1><p>It will expire in 5 minutes.</p>`
    );

    admin.code = code;
    admin.code_expire_in = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    return res
      .status(200)
      .json({ message: "Verification code sent to admin email" });
  } catch (error: any) {
    console.error("Error in getVerificationCode:", error);
    return res
      .status(500)
      .json({ message: error.message || "Something went wrong" });
  }
}

export async function verifyCode(req: Request, res: Response) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ message: validation.array()[0].msg });
  }
  const email = process.env.ADMIN_EMAIL as string;
  try {
    const admin = await Admin.findOne({ email });
    const token = jwt.sign(
      {
        email: admin!.email,
        adminId: admin!._id,
      },
      process.env.JWT_SECRET as string
    );
    return res.status(200).json({ token });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Something went wrong" });
  }
}
