import prisma from "@repo/db";

export interface DashboardFilters {
  range?: string;
  type?: string;
}

const buildWhere = (userId: string, role: string, filters?: DashboardFilters) => {
  const where: any = role !== "Admin" ? { userId } : {};

  if (filters?.type && filters.type !== "All records") {
    // assume income or expense
    where.type = filters.type.toLowerCase();
  }

  if (filters?.range && filters.range !== "All Time") {
    const now = new Date();
    if (filters.range === "7D") {
      now.setDate(now.getDate() - 7);
      where.date = { gte: now };
    } else if (filters.range === "30D") {
      now.setDate(now.getDate() - 30);
      where.date = { gte: now };
    } else if (filters.range === "YTD") {
      where.date = { gte: new Date(now.getFullYear(), 0, 1) };
    }
  }

  return where;
};

export const getSummary = async (userId: string, role: string, filters?: DashboardFilters) => {
  const where = buildWhere(userId, role, filters);

  const records = await prisma.record.findMany({ where });

  const income = records
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + r.amount, 0);
  const expenses = records
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + r.amount, 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    totalRecords: records.length,
  };
};

export const getCategoryWise = async (userId: string, role: string, filters?: DashboardFilters) => {
  const where = buildWhere(userId, role, filters);

  const records = await prisma.record.findMany({ where });

  const map: Record<string, { income: number; expense: number }> = {};
  for (const r of records) {
    if (!map[r.category]) map[r.category] = { income: 0, expense: 0 };
    if (r.type === "income") map[r.category].income += r.amount;
    else map[r.category].expense += r.amount;
  }

  return Object.entries(map).map(([category, data]) => ({
    category,
    ...data,
    net: data.income - data.expense,
  }));
};

export const getTrends = async (userId: string, role: string, filters?: DashboardFilters) => {
  const where = buildWhere(userId, role, filters);
  const records = await prisma.record.findMany({
    where,
    orderBy: { date: "asc" },
  });

  const map: Record<string, { income: number; expense: number }> = {};
  for (const r of records) {
    const month = r.date.toISOString().slice(0, 7); // "YYYY-MM"
    if (!map[month]) map[month] = { income: 0, expense: 0 };
    if (r.type === "income") map[month].income += r.amount;
    else map[month].expense += r.amount;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data, net: data.income - data.expense }));
};

export const getRecent = async (
  userId: string,
  role: string,
  limit = 10,
  filters?: DashboardFilters
) => {
  const where = buildWhere(userId, role, filters);
  return prisma.record.findMany({
    where,
    orderBy: { date: "desc" },
    take: limit,
    include: { user: { select: { name: true } } },
  });
};
