import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Viewer", "Analyst", "Admin"]).default("Viewer"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["Viewer", "Analyst", "Admin"]).default("Viewer"),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["Viewer", "Analyst", "Admin"]).optional(),
});

export const RecordCreateSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const RecordUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().min(1).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export const RecordFilterSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UserInput = z.infer<typeof UserSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type RecordCreateInput = z.infer<typeof RecordCreateSchema>;
export type RecordUpdateInput = z.infer<typeof RecordUpdateSchema>;
export type RecordFilterInput = z.infer<typeof RecordFilterSchema>;
