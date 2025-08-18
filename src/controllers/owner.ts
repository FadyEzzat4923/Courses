import { Request, Response } from "express";
import Owner from "../models/owner.js";
import { sendEmail } from "../config/sendEmail.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import generateVerificationCode from "../util/generateVerificationCode.js";
import { Types } from "mongoose";

export async function getVerificationCode(req: Request, res: Response) {
  const ownerId = req.admin!.ownerId;
  const code = generateVerificationCode();

  try {
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    owner.code = code;
    owner.code_expire_in = new Date(Date.now() + 10 * 60 * 1000);
    await owner.save();

    await sendEmail(
      owner.email,
      "Owner Verification Code",
      `
        <div
      style="
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div
        style="
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          padding: 40px 30px;
          max-width: 450px;
          width: 100%;
          text-align: center;
        "
      >
        <h1
          style="
            font-size: 2.5rem;
            margin-bottom: 15px;
            color: transparent;
            background-image: linear-gradient(45deg, red, orange, purple);
            -webkit-background-clip: text;
            background-clip: text;
          "
        >
          Owner Verification
        </h1>
        <p style="font-size: 1rem; color: #555; margin-bottom: 25px">
          Please use the code below to verify your ownership. This code is valid
          for the next <strong>10 minutes</strong>.
        </p>
        <div
          style="
            font-size: 2rem;
            font-weight: bold;
            letter-spacing: 5px;
            color: #004db1;
            background: #f3f7ff;
            padding: 15px;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 20px;
          "
        >
         ${code}
        </div>
      </div>
    </div>
      `
    );

    return res
      .status(200)
      .json({ message: "Verification code sent to Owner email" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

export async function verifyCode(req: Request, res: Response) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res.status(400).json({ message: validation.array()[0].msg });
  }
  const { ownerId, _id: adminId } = req.admin!;
  try {
    const owner = await Owner.findById(ownerId);
    if (owner) {
      const exists = owner.verifiedAdmin?.some(
        (id) => id.toString() === adminId.toString()
      );

      if (!exists) {
        owner.verifiedAdmin?.push(adminId as any);
        await owner.save();
      }
    }
    const token = jwt.sign(
      {
        ownerId,
        adminId,
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
