import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Viewer", "Analyst", "Admin"]).default("Viewer"),
});

export const RecordSchema = z.object({
  id: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string(),
  date: z.date().default(new Date()),
  notes: z.string().optional(),
  userId: z.string()
});
