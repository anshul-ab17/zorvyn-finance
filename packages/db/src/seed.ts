import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up
  await prisma.record.deleteMany();
  await prisma.user.deleteMany();

  const adminPass  = await bcrypt.hash("admin123",  12);
  const user1Pass  = await bcrypt.hash("user123",   12);
  const user2Pass  = await bcrypt.hash("alex123",   12);
  const user3Pass  = await bcrypt.hash("sara123",   12);
  const user4Pass  = await bcrypt.hash("rohan123",  12);

  // ── Users ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { name: "Anshul Bharat", email: "admin@pockit.dev", password: adminPass, role: "Admin", monthlyLimit: 50000 },
  });

  const priya = await prisma.user.create({
    data: { name: "Priya Sharma",  email: "priya@pockit.dev",  password: user1Pass, role: "User", monthlyLimit: 30000 },
  });

  const alex = await prisma.user.create({
    data: { name: "Alex Chen",     email: "alex@pockit.dev",   password: user2Pass, role: "User", monthlyLimit: 40000 },
  });

  const sara = await prisma.user.create({
    data: { name: "Sara Kapoor",   email: "sara@pockit.dev",   password: user3Pass, role: "User", monthlyLimit: 25000 },
  });

  const rohan = await prisma.user.create({
    data: { name: "Rohan Mehta",   email: "rohan@pockit.dev",  password: user4Pass, role: "User", monthlyLimit: 35000 },
  });

  const now = new Date();
  const m  = now.getMonth();
  const y  = now.getFullYear();
  const d  = (month: number, day: number) => new Date(y, month, day);

  // ── Admin records (current + 2 previous months) ──────────────────────────
  await prisma.record.createMany({ data: [
    // two months ago
    { userId: admin.id, amount: 85000, type: "income",  category: "Salary",       notes: "Monthly salary",          date: d(m-2, 1)  },
    { userId: admin.id, amount: 12000, type: "expense", category: "Rent",         notes: "Apartment rent",          date: d(m-2, 3)  },
    { userId: admin.id, amount: 4200,  type: "expense", category: "Food",         notes: "Groceries + dining",      date: d(m-2, 7)  },
    { userId: admin.id, amount: 2500,  type: "expense", category: "Transport",    notes: "Fuel + Uber",             date: d(m-2, 10) },
    { userId: admin.id, amount: 6000,  type: "income",  category: "Freelance",    notes: "Design project",          date: d(m-2, 14) },
    { userId: admin.id, amount: 1800,  type: "expense", category: "Utilities",    notes: "Electricity + internet",  date: d(m-2, 18) },
    { userId: admin.id, amount: 9500,  type: "expense", category: "Shopping",     notes: "Gadgets",                 date: d(m-2, 22) },
    { userId: admin.id, amount: 3000,  type: "income",  category: "Investment",   notes: "Dividend",                date: d(m-2, 25) },
    // last month
    { userId: admin.id, amount: 85000, type: "income",  category: "Salary",       notes: "Monthly salary",          date: d(m-1, 1)  },
    { userId: admin.id, amount: 12000, type: "expense", category: "Rent",         notes: "Apartment rent",          date: d(m-1, 3)  },
    { userId: admin.id, amount: 5500,  type: "expense", category: "Food",         notes: "Groceries + dining",      date: d(m-1, 8)  },
    { userId: admin.id, amount: 2200,  type: "expense", category: "Transport",    notes: "Cab + metro",             date: d(m-1, 11) },
    { userId: admin.id, amount: 8000,  type: "income",  category: "Freelance",    notes: "Backend contract",        date: d(m-1, 15) },
    { userId: admin.id, amount: 1800,  type: "expense", category: "Utilities",    notes: "Bills",                   date: d(m-1, 17) },
    { userId: admin.id, amount: 3200,  type: "expense", category: "Health",       notes: "Gym + doctor visit",      date: d(m-1, 20) },
    { userId: admin.id, amount: 4000,  type: "expense", category: "Shopping",     notes: "Clothing",                date: d(m-1, 24) },
    { userId: admin.id, amount: 2500,  type: "income",  category: "Investment",   notes: "Stock sale",              date: d(m-1, 27) },
    // this month
    { userId: admin.id, amount: 85000, type: "income",  category: "Salary",       notes: "Monthly salary",          date: d(m, 1)    },
    { userId: admin.id, amount: 12000, type: "expense", category: "Rent",         notes: "Apartment rent",          date: d(m, 3)    },
    { userId: admin.id, amount: 3500,  type: "expense", category: "Food",         notes: "Groceries",               date: d(m, 7)    },
    { userId: admin.id, amount: 2200,  type: "expense", category: "Transport",    notes: "Fuel",                    date: d(m, 10)   },
    { userId: admin.id, amount: 5000,  type: "income",  category: "Freelance",    notes: "Web project",             date: d(m, 12)   },
    { userId: admin.id, amount: 1800,  type: "expense", category: "Utilities",    notes: "Internet + electricity",  date: d(m, 14)   },
    { userId: admin.id, amount: 4500,  type: "expense", category: "Food",         notes: "Restaurants + delivery",  date: d(m, 17)   },
    { userId: admin.id, amount: 8000,  type: "expense", category: "Shopping",     notes: "Electronics",             date: d(m, 20)   },
    { userId: admin.id, amount: 3000,  type: "income",  category: "Investment",   notes: "Dividend",                date: d(m, 22)   },
    { userId: admin.id, amount: 1200,  type: "expense", category: "Health",       notes: "Gym + supplements",       date: d(m, 25)   },
  ]});

  // ── Priya records ─────────────────────────────────────────────────────────
  await prisma.record.createMany({ data: [
    { userId: priya.id, amount: 65000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m-2, 1)  },
    { userId: priya.id, amount: 10000, type: "expense", category: "Rent",         notes: "Studio rent",       date: d(m-2, 3)  },
    { userId: priya.id, amount: 3200,  type: "expense", category: "Food",         notes: "Groceries",         date: d(m-2, 9)  },
    { userId: priya.id, amount: 1500,  type: "expense", category: "Transport",    notes: "Metro pass",        date: d(m-2, 12) },
    { userId: priya.id, amount: 4000,  type: "income",  category: "Freelance",    notes: "Content writing",   date: d(m-2, 18) },
    { userId: priya.id, amount: 65000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m-1, 1)  },
    { userId: priya.id, amount: 10000, type: "expense", category: "Rent",         notes: "Studio rent",       date: d(m-1, 3)  },
    { userId: priya.id, amount: 3800,  type: "expense", category: "Food",         notes: "Dining + groceries",date: d(m-1, 8)  },
    { userId: priya.id, amount: 2000,  type: "expense", category: "Shopping",     notes: "Clothes",           date: d(m-1, 15) },
    { userId: priya.id, amount: 1200,  type: "expense", category: "Health",       notes: "Checkup",           date: d(m-1, 20) },
    { userId: priya.id, amount: 65000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m, 1)    },
    { userId: priya.id, amount: 10000, type: "expense", category: "Rent",         notes: "Studio rent",       date: d(m, 3)    },
    { userId: priya.id, amount: 2800,  type: "expense", category: "Food",         notes: "Monthly food",      date: d(m, 8)    },
    { userId: priya.id, amount: 1500,  type: "expense", category: "Transport",    notes: "Cab + metro",       date: d(m, 14)   },
    { userId: priya.id, amount: 5000,  type: "income",  category: "Freelance",    notes: "Design gig",        date: d(m, 20)   },
  ]});

  // ── Alex records ──────────────────────────────────────────────────────────
  await prisma.record.createMany({ data: [
    { userId: alex.id, amount: 90000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m-2, 1)  },
    { userId: alex.id, amount: 18000, type: "expense", category: "Rent",         notes: "2BHK rent",         date: d(m-2, 2)  },
    { userId: alex.id, amount: 6000,  type: "expense", category: "Food",         notes: "Restaurants",       date: d(m-2, 10) },
    { userId: alex.id, amount: 3500,  type: "expense", category: "Transport",    notes: "Car EMI + fuel",    date: d(m-2, 12) },
    { userId: alex.id, amount: 15000, type: "income",  category: "Investment",   notes: "Crypto profit",     date: d(m-2, 16) },
    { userId: alex.id, amount: 5000,  type: "expense", category: "Shopping",     notes: "Books + software",  date: d(m-2, 22) },
    { userId: alex.id, amount: 2500,  type: "expense", category: "Utilities",    notes: "Bills",             date: d(m-2, 25) },
    { userId: alex.id, amount: 90000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m-1, 1)  },
    { userId: alex.id, amount: 18000, type: "expense", category: "Rent",         notes: "2BHK rent",         date: d(m-1, 2)  },
    { userId: alex.id, amount: 7500,  type: "expense", category: "Food",         notes: "Dining out",        date: d(m-1, 9)  },
    { userId: alex.id, amount: 3500,  type: "expense", category: "Transport",    notes: "Car EMI",           date: d(m-1, 12) },
    { userId: alex.id, amount: 12000, type: "income",  category: "Freelance",    notes: "Consulting",        date: d(m-1, 18) },
    { userId: alex.id, amount: 8000,  type: "expense", category: "Shopping",     notes: "Electronics",       date: d(m-1, 24) },
    { userId: alex.id, amount: 90000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m, 1)    },
    { userId: alex.id, amount: 18000, type: "expense", category: "Rent",         notes: "2BHK rent",         date: d(m, 2)    },
    { userId: alex.id, amount: 5500,  type: "expense", category: "Food",         notes: "Groceries + dining",date: d(m, 10)   },
    { userId: alex.id, amount: 3500,  type: "expense", category: "Transport",    notes: "Fuel + EMI",        date: d(m, 13)   },
    { userId: alex.id, amount: 10000, type: "income",  category: "Investment",   notes: "Dividend",          date: d(m, 17)   },
    { userId: alex.id, amount: 4200,  type: "expense", category: "Health",       notes: "Insurance + gym",   date: d(m, 21)   },
  ]});

  // ── Sara records ──────────────────────────────────────────────────────────
  await prisma.record.createMany({ data: [
    { userId: sara.id, amount: 55000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m-2, 1)  },
    { userId: sara.id, amount: 9000,  type: "expense", category: "Rent",         notes: "PG accommodation",  date: d(m-2, 3)  },
    { userId: sara.id, amount: 4000,  type: "expense", category: "Food",         notes: "Canteen + groceries",date: d(m-2, 8) },
    { userId: sara.id, amount: 1200,  type: "expense", category: "Transport",    notes: "Metro monthly pass", date: d(m-2, 5) },
    { userId: sara.id, amount: 3000,  type: "income",  category: "Freelance",    notes: "Tutoring",          date: d(m-2, 20) },
    { userId: sara.id, amount: 55000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m-1, 1)  },
    { userId: sara.id, amount: 9000,  type: "expense", category: "Rent",         notes: "PG accommodation",  date: d(m-1, 3)  },
    { userId: sara.id, amount: 3500,  type: "expense", category: "Food",         notes: "Groceries",         date: d(m-1, 9)  },
    { userId: sara.id, amount: 2500,  type: "expense", category: "Shopping",     notes: "Stationery + misc", date: d(m-1, 16) },
    { userId: sara.id, amount: 1000,  type: "expense", category: "Health",       notes: "Medicines",         date: d(m-1, 22) },
    { userId: sara.id, amount: 55000, type: "income",  category: "Salary",       notes: "Monthly salary",    date: d(m, 1)    },
    { userId: sara.id, amount: 9000,  type: "expense", category: "Rent",         notes: "PG accommodation",  date: d(m, 3)    },
    { userId: sara.id, amount: 3800,  type: "expense", category: "Food",         notes: "Groceries + dining",date: d(m, 7)    },
    { userId: sara.id, amount: 1200,  type: "expense", category: "Transport",    notes: "Metro pass",        date: d(m, 10)   },
    { userId: sara.id, amount: 28000, type: "expense", category: "Shopping",     notes: "Laptop purchase",   date: d(m, 18)   },
  ]});

  // ── Rohan records ─────────────────────────────────────────────────────────
  await prisma.record.createMany({ data: [
    { userId: rohan.id, amount: 72000, type: "income",  category: "Salary",      notes: "Monthly salary",    date: d(m-2, 1)  },
    { userId: rohan.id, amount: 14000, type: "expense", category: "Rent",        notes: "1BHK rent",         date: d(m-2, 2)  },
    { userId: rohan.id, amount: 5000,  type: "expense", category: "Food",        notes: "Meals + groceries", date: d(m-2, 7)  },
    { userId: rohan.id, amount: 3000,  type: "expense", category: "Transport",   notes: "Bike EMI",          date: d(m-2, 10) },
    { userId: rohan.id, amount: 8000,  type: "income",  category: "Investment",  notes: "Mutual fund gain",  date: d(m-2, 15) },
    { userId: rohan.id, amount: 2000,  type: "expense", category: "Utilities",   notes: "Bills",             date: d(m-2, 20) },
    { userId: rohan.id, amount: 72000, type: "income",  category: "Salary",      notes: "Monthly salary",    date: d(m-1, 1)  },
    { userId: rohan.id, amount: 14000, type: "expense", category: "Rent",        notes: "1BHK rent",         date: d(m-1, 2)  },
    { userId: rohan.id, amount: 6200,  type: "expense", category: "Food",        notes: "Dining + groceries",date: d(m-1, 8)  },
    { userId: rohan.id, amount: 3000,  type: "expense", category: "Transport",   notes: "Bike EMI + fuel",   date: d(m-1, 10) },
    { userId: rohan.id, amount: 5000,  type: "income",  category: "Freelance",   notes: "App development",   date: d(m-1, 17) },
    { userId: rohan.id, amount: 4500,  type: "expense", category: "Health",      notes: "Insurance premium", date: d(m-1, 25) },
    { userId: rohan.id, amount: 72000, type: "income",  category: "Salary",      notes: "Monthly salary",    date: d(m, 1)    },
    { userId: rohan.id, amount: 14000, type: "expense", category: "Rent",        notes: "1BHK rent",         date: d(m, 2)    },
    { userId: rohan.id, amount: 5500,  type: "expense", category: "Food",        notes: "Groceries",         date: d(m, 6)    },
    { userId: rohan.id, amount: 3000,  type: "expense", category: "Transport",   notes: "Bike EMI",          date: d(m, 10)   },
    { userId: rohan.id, amount: 6000,  type: "income",  category: "Investment",  notes: "Stock dividend",    date: d(m, 14)   },
    { userId: rohan.id, amount: 7500,  type: "expense", category: "Shopping",    notes: "Camera lens",       date: d(m, 19)   },
    { userId: rohan.id, amount: 2000,  type: "expense", category: "Utilities",   notes: "Bills",             date: d(m, 23)   },
  ]});

  console.log("Seed complete!");
  console.log("\nDemo Accounts:");
  console.log("  Admin: admin@pockit.dev  / admin123");
  console.log("  User:  priya@pockit.dev  / user123");
  console.log("  User:  alex@pockit.dev   / alex123");
  console.log("  User:  sara@pockit.dev   / sara123");
  console.log("  User:  rohan@pockit.dev  / rohan123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
