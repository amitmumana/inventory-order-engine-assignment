import { PrismaClient, User, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export class AuthService {
  async signup(
    email: string,
    password: string
  ): Promise<Omit<User, "password">> {
    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.USER,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: Omit<User, "password"> }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = jwt.sign(
      { userId: user.id, userRole: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }
}
