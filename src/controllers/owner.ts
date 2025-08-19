import { Request, Response } from "express";
import Owner from "../models/owner.js";
import { sendEmail } from "../config/sendEmail.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import generateVerificationCode from "../util/generateVerificationCode.js";
import { ownerEmail } from "../util/sendEmailHTML.js";

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

    const HTML = ownerEmail(code, owner!.ownerName);
    await sendEmail(owner.email, "Owner Verification Code",HTML);

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
    return res
      .status(400)
      .json({ errors: { code: validation.array()[0].msg } });
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
