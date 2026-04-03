import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 12);
};

export const comparePassword = async (
  plain: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, SECRET) as TokenPayload;
};

export const getUserFromToken = (
  authHeader?: string | null
): TokenPayload | null => {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
};

// RBAC 
export const ROLES = {
  User: 1,
  Admin: 2,
} as const;

export type Role = keyof typeof ROLES;

export const checkRole = (userRole: string, requiredRoles: Role[]): boolean => {
  return requiredRoles.includes(userRole as Role);
};

export const hasMinRole = (userRole: string, minRole: Role): boolean => {
  return ROLES[userRole as Role] >= ROLES[minRole];
};
