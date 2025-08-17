import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string;
      email: string;
    };
  }
}

async function isAuth(req: Request, res: Response, next: NextFunction) {
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
    const decoded = verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || typeof decoded !== "object") {
      return res
        .status(401)
        .json({ message: "Token is not valid or expired." });
    }

    req.user = {
      email: decoded.email,
      _id: decoded.adminId,
    };

    next();
    return;
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed.", error });
  }
}

export default isAuth;
