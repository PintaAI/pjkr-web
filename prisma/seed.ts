import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password123'; // Choose a strong password in a real application

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user with email ${adminEmail} already exists.`);
    return;
  }

  const hashedPassword = hashSync(adminPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      role: 'ADMIN',
      name: 'Admin User',
      emailVerified: true, // Assuming admin emails are verified by default
      accounts: {
        create: {
          providerId: 'email', // Or 'credentials' depending on your auth setup
          accountId: adminEmail,
          password: hashedPassword,
          // Add other necessary fields for Account model if any
        },
      },
    },
    include: {
      accounts: true, // Include accounts to confirm creation
    },
  });

  console.log(`Admin user created successfully: ${adminUser.email}`);
  if (adminUser.accounts.length > 0) {
    console.log(`Associated account created with providerId: ${adminUser.accounts[0].providerId}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
