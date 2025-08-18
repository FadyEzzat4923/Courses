import { Router } from "express";
import { body } from "express-validator";
import { verifyLogin, login, addAdmin } from "../controllers/admin.js";
import Admin from "../models/admin.js";
import { compare } from "bcryptjs";

declare module "express-serve-static-core" {
  interface Request {
    adminData?: typeof Admin.prototype;
  }
}

const router = Router();

router.post(
  "/add-admin",
  [
    body("adminName", "Admin name is required.").trim().notEmpty(),
    body("email", "E-Mail must be valid.")
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom(async (val) => {
        const admin = await Admin.findOne({ email: val });
        if (admin) {
          throw new Error("Admin already exists.");
        }
        return true;
      }),
    body("password", "Password must be strong (upper, lower, digit, symbol).")
      .trim()
      .isStrongPassword(),
    body("centerName", "Center name is required.").trim().notEmpty(),
  ],
  addAdmin
);

router.post(
  "/login",
  [
    body("email", "E-Mail must be valid.")
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom(async (val, { req }) => {
        const admin = await Admin.findOne({ email: val });
        if (!admin) {
          throw new Error("Admin does not exist.");
        }
        return true;
      }),
    body("password", "Password is required.")
      .trim()
      .notEmpty()
      .custom(async (val, { req }) => {
        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) return true;
        const isMatched = await compare(val, admin.password);
        if (!isMatched) {
          throw new Error("Invalid password");
        }
        return true;
      }),
  ],
  login
);

router.post(
  "/verify-login",
  body("code", "Verification Code must be 6 numbers.")
    .trim()
    .isLength({ max: 6, min: 6 })
    .custom(async (val, { req }) => {
      const admin = await Admin.findOne({ code: val });

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

      if (Number(val) !== admin.code) {
        throw new Error("Invalid verification code");
      }

      admin.code = undefined;
      admin.code_expire_in = undefined;
      await admin.save();
      req.adminData = admin;
      return true;
    }),
  verifyLogin
);

export default router;
