import { Request, Response } from "express";
import Admin from "../models/admin.js";
import { sendEmail } from "../config/sendEmail.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { hash } from "bcryptjs";
import Owner from "../models/owner.js";
import generateVerificationCode from "../util/generateVerificationCode.js";
import { adminEmail } from "../util/sendEmailHTML.js";

export async function addAdmin(req: Request, res: Response) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const errors: {
      adminName?: string;
      email?: string;
      password?: string;
      centerName?: string;
    } = {};

    for (const err of validation.array()) {
      if ("path" in err) {
        errors[err.path as keyof typeof errors] = err.msg;
      }
    }

    return res.status(400).json({ errors });
  }

  const JWT_SECRET = process.env.JWT_SECRET as string;
  const ownerEmail = process.env.OWNER_EMAIL as string;
  const { adminName, email, password, centerName } = req.body;

  try {
    const hashPassword = await hash(password, 12);

    const admin = new Admin({
      adminName,
      email,
      password: hashPassword,
      centerName,
    });

    await admin.save();

    const owner = await Owner.findOne({ email: ownerEmail });
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const token = jwt.sign(
      {
        _id: admin._id.toString(),
        ownerId: owner._id.toString(),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(201)
      .json({ message: "Admin created successfully", token });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const errors: {
      email?: string;
      password?: string;
    } = {};

    for (const err of validation.array()) {
      if ("path" in err) {
        errors[err.path as keyof typeof errors] = err.msg;
      }
    }

    return res.status(400).json({ errors });
  }

  const { email } = req.body;
  const code = generateVerificationCode();
  const ownerEmail = process.env.OWNER_EMAIL as string;
  const JWT_SECRET = process.env.JWT_SECRET as string;

  try {
    const admin = await Admin.findOne({ email });
    const owner = await Owner.findOne({ email: ownerEmail });

    const isAdminVerified = owner!.verifiedAdmin?.some(
      (adminId) => adminId.toString() === (admin!._id as any).toString()
    );

    if (!isAdminVerified) {
      return res
        .status(401)
        .json({ message: "This admin account not verified yet." });
    }

    admin!.code = code;
    admin!.code_expire_in = new Date(Date.now() + 10 * 60 * 1000);
    await admin!.save();

    const HTML = adminEmail(code, admin!.adminName, admin!.centerName);
    await sendEmail(email, "Admin Verification Code", HTML);

    const token = jwt.sign(
      {
        _id: admin!._id.toString(),
        ownerId: owner!._id.toString(),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ message: "Verification code sent to Admin email", token });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}

export async function verifyLogin(req: Request, res: Response) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    return res
      .status(400)
      .json({ errors: { code: validation.array()[0].msg } });
  }

  const code = req.body.code;
  const { ownerId, _id: adminId } = req.admin!;
  try {
    const admin = await Admin.findById(adminId);

    if (!admin) throw new Error("Admin not found");
    if (!admin.code || !admin.code_expire_in) {
      throw new Error("No active verification code");
    }

    const now = new Date();
    if (now > admin.code_expire_in) {
      admin.code = undefined;
      admin.code_expire_in = undefined;
      await admin.save();
      throw new Error("Verification code expired");
    }

    if (Number(code) !== admin.code) {
      throw new Error("Invalid verification code");
    }

    admin.code = undefined;
    admin.code_expire_in = undefined;
    await admin.save();

    const token = jwt.sign(
      {
        ownerId,
        adminId,
      },
      process.env.JWT_SECRET as string
    );

    return res.status(200).json({ token });
  } catch (error: any) {
    return res.status(500).json({ message: "Something went wrong" });
  }
}
