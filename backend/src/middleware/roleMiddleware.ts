import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    userRole: Role;
  };
}

export const roleMiddleware = (requiredRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.userRole) {
      return res
        .status(403)
        .json({ error: "Access denied. Authentication required." });
    }

    if (req.user.userRole !== requiredRole) {
      return res
        .status(403)
        .json({ error: "Access denied. Insufficient permissions." });
    }

    next();
  };
};
