import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { PrismaClient } from "@prisma/client";

const authService = new AuthService();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    userRole: string;
  };
}

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await authService.signup(email, password);
      res.status(201).json({ message: "User created successfully.", user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { token, user } = await authService.login(email, password);
      res.status(200).json({ message: "Logged in successfully.", token, user });
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated." });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }
}
