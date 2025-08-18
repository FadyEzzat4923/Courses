import { Router } from "express";
import { body } from "express-validator";
import { getVerificationCode, verifyCode } from "../controllers/owner.js";
import Owner from "../models/owner.js";
import decodeAdmin from "../middleware/decode-admin.js";

const router = Router();

router.post("/verification-code", decodeAdmin, getVerificationCode);

router.post(
  "/verify",
  decodeAdmin,
  body("code", "Verification Code must be 6 numbers.")
    .trim()
    .isLength({ max: 6, min: 6 })
    .custom(async (val, { req }) => {
      const email = process.env.OWNER_EMAIL;
      const owner = await Owner.findOne({ email });
      if (!owner) {
        throw new Error("Owner not found");
      }

      if (!owner.code || !owner.code_expire_in) {
        throw new Error("No active verification code");
      }

      const now = new Date();
      if (now > owner.code_expire_in) {
        owner.code = undefined;
        owner.code_expire_in = undefined;
        await owner.save();
        throw new Error("Verification code expired");
      }

      if (Number(val) !== owner.code) {
        throw new Error("Invalid verification code");
      }

      owner.code = undefined;
      owner.code_expire_in = undefined;
      await owner.save();
      return true;
    }),
  verifyCode
);

export default router;
