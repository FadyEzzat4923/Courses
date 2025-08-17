import { Router } from "express";
import { body } from "express-validator";
import { getVerificationCode, verifyCode } from "../controllers/admin.js";
import Admin from "../models/admin.js";

const router = Router();

router.post("/verification-code", getVerificationCode);

router.post(
  "/verify",
  body("code", "Verification Code must be 6 numbers.")
    .trim()
    .isLength({ max: 6, min: 6 })
    .custom(async (val, { req }) => {
      const email = process.env.ADMIN_EMAIL;
      const admin = await Admin.findOne({ email });
      if (!admin) {
        throw new Error("Admin not found");
      }

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
      return true;
    }),
  verifyCode
);

export default router;
