import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("?? Seeding database...");

  // Clean up
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 12);
  const analystPassword = await bcrypt.hash("analyst123", 12);
  const viewerPassword = await bcrypt.hash("viewer123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Anshul Bharat",
      email: "admin@zorvyn.dev",
      password: adminPassword,
      role: "Admin",
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "analyst@zorvyn.dev",
      password: analystPassword,
      role: "Analyst",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Rahul Verma",
      email: "viewer@zorvyn.dev",
      password: viewerPassword,
      role: "Viewer",
    },
  });

  // Seed records for admin
  const now = new Date();
  const records = [
    { amount: 85000, type: "income",  category: "Salary",      notes: "Monthly salary",         date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { amount: 12000, type: "expense", category: "Rent",        notes: "Apartment rent",          date: new Date(now.getFullYear(), now.getMonth(), 3) },
    { amount: 3500,  type: "expense", category: "Food",        notes: "Groceries + dining out",  date: new Date(now.getFullYear(), now.getMonth(), 7) },
    { amount: 2200,  type: "expense", category: "Transport",   notes: "Fuel + Uber",             date: new Date(now.getFullYear(), now.getMonth(), 10) },
    { amount: 5000,  type: "income",  category: "Freelance",   notes: "Web project payment",     date: new Date(now.getFullYear(), now.getMonth(), 12) },
    { amount: 1800,  type: "expense", category: "Utilities",   notes: "Electricity + internet",  date: new Date(now.getFullYear(), now.getMonth(), 14) },
    { amount: 4500,  type: "expense", category: "Food",        notes: "Restaurant + delivery",   date: new Date(now.getFullYear(), now.getMonth(), 17) },
    { amount: 8000,  type: "expense", category: "Shopping",    notes: "Electronics purchase",    date: new Date(now.getFullYear(), now.getMonth(), 20) },
    { amount: 3000,  type: "income",  category: "Investment",  notes: "Dividend received",       date: new Date(now.getFullYear(), now.getMonth(), 22) },
    { amount: 1200,  type: "expense", category: "Health",      notes: "Gym + supplements",       date: new Date(now.getFullYear(), now.getMonth(), 25) },
  ] as const;

  for (const r of records) {
    await prisma.record.create({
      data: { ...r, userId: admin.id },
    });
  }

  // Seed a few records for analyst
  await prisma.record.createMany({
    data: [
      { amount: 65000, type: "income",  category: "Salary",  notes: "Monthly salary", userId: analyst.id, date: new Date(now.getFullYear(), now.getMonth(), 1) },
      { amount: 10000, type: "expense", category: "Rent",    notes: "Studio rent",    userId: analyst.id, date: new Date(now.getFullYear(), now.getMonth(), 3) },
      { amount: 2800,  type: "expense", category: "Food",    notes: "Monthly food",   userId: analyst.id, date: new Date(now.getFullYear(), now.getMonth(), 8) },
    ],
  });

  console.log("? Seed complete!");
  console.log("\n?? Demo Accounts:");
  console.log("  Admin:   admin@zorvyn.dev   / admin123");
  console.log("  Analyst: analyst@zorvyn.dev / analyst123");
  console.log("  Viewer:  viewer@zorvyn.dev  / viewer123");
}

main()
  .catch((e) => {
    console.error("? Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
