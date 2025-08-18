import { Router } from "express";
import { body } from "express-validator";
import { verifyLogin, login, addAdmin } from "../controllers/admin.js";
import Admin from "../models/admin.js";
import { compare } from "bcryptjs";
import decodeAdmin from "../middleware/decode-admin.js";

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
  decodeAdmin,
  body("code", "Verification Code must be 6 numbers.")
    .trim()
    .isLength({ max: 6, min: 6 }),
  verifyLogin
);

export default router;
