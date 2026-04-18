import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Category, PrismaClient, User } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/auth";

// Validate environment variables
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize database connection
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");
  try {
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    const users: User[] = [
      {
        id: "1",
        email: "fidelis@gmail.com",
        password: "password123",
        name: "Fidelis Mbam",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        email: "user@gmail.com",
        password: "user12345678",
        name: "Regular User",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const user of users) {
      const hashedPassword = await hashPassword(user.password);
      await prisma.user.create({ data: { ...user, password: hashedPassword } });
    }
    console.log("Created users");

    const categories: Category[] = [
      { id: "1", name: "World", slug: "world" },
      { id: "2", name: "Politics", slug: "politics" },
      { id: "3", name: "Business", slug: "business" },
      { id: "4", name: "Technology", slug: "technology" },
      { id: "5", name: "Sports", slug: "sports" },
      { id: "6", name: "Entertainment", slug: "entertainment" },
      { id: "7", name: "Health", slug: "health" },
      { id: "8", name: "Science", slug: "science" },
    ];

    for (const category of categories) {
      await prisma.category.create({ data: category });
      console.log(`Created category: ${category}`);
    }
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error("seeding error:", error);
  }
}

main()
  .then(async () => {
    // await pool.end();
    console.log("Database connection closed.");
  })
  .catch(async (error) => {
    console.error("Fatal error:", error);
    // await pool.end();
    process.exit(1);
  });
