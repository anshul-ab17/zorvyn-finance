import prisma from "@repo/db";
import type { UserUpdateInput } from "@repo/validation";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true,
      monthlyLimit: true,
      smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true,
      createdAt: true,
    },
  })
  if (!user) return null
  const { smtpPass, ...rest } = user
  return { ...rest, smtpConfigured: !!smtpPass }
};

export const updateUser = async (id: string, data: UserUpdateInput) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      monthlyLimit: true,
      smtpHost: true, smtpPort: true, smtpUser: true,
      updatedAt: true,
    },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({ where: { id } });
};
