import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

export const generateToken = (payload: object) => {
  return jwt.sign(payload, SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET);
};

export const checkRole = (userRole: string, requiredRoles: string[]) => {
  return requiredRoles.includes(userRole);
};
