import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL Connected...');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

export { prisma, connectDB };
