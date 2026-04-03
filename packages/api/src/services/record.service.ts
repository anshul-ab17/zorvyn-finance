import prisma from "@repo/db";
import type { RecordCreateInput, RecordUpdateInput, RecordFilterInput } from "@repo/validation";

export const createRecord = async (
  userId: string,
  data: RecordCreateInput
) => {
  return prisma.record.create({
    data: {
      ...data,
      type: data.type as "income" | "expense",
      date: data.date ? new Date(data.date) : new Date(),
      userId,
    },
  });
};

export const getRecords = async (
  userId: string,
  userRole: string,
  filters: RecordFilterInput
) => {
  const { type, category, from, to, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    ...(userRole !== "Admin" ? { userId } : {}),
    ...(type ? { type } : {}),
    ...(category ? { category } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.record.count({ where }),
  ]);

  return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getRecordById = async (id: string, userId: string, role: string) => {
  const record = await prisma.record.findUnique({ where: { id } });
  if (!record) return null;
  if (role !== "Admin" && record.userId !== userId) return null;
  return record;
};

export const updateRecord = async (
  id: string,
  userId: string,
  role: string,
  data: RecordUpdateInput
) => {
  const record = await prisma.record.findUnique({ where: { id } });
  if (!record) return null;
  if (role !== "Admin" && record.userId !== userId) return null;
  return prisma.record.update({
    where: { id },
    data: {
      ...data,
      ...(data.type ? { type: data.type as "income" | "expense" } : {}),
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
  });
};

export const deleteRecord = async (id: string, userId: string, role: string) => {
  const record = await prisma.record.findUnique({ where: { id } });
  if (!record) return null;
  if (role !== "Admin" && record.userId !== userId) return null;
  return prisma.record.delete({ where: { id } });
};
