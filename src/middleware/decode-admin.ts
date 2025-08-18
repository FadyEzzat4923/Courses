import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    admin?: {
      _id: string;
      ownerId: string;
    };
  }
}

async function decodeAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing or invalid." });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token is required." });
    }

    const JWT_SECRET = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded !== "object") {
      return res
        .status(401)
        .json({ message: "Token is not valid or expired." });
    }

    req.admin = {
      _id: decoded._id,
      ownerId: decoded.ownerId,
    };

    next();
    return;
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed.", error });
  }
}

export default decodeAdmin;
