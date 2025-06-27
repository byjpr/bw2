/**
 * This script sets up test users with different roles and permissions
 * for manual testing of authorization controls
 */
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users with different roles
  console.log('Creating test users...');
  
  // 1. Regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { 
      role: UserRole.USER,
      name: 'Regular User',
    },
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      role: UserRole.USER,
    },
  });
  console.log(`Created regular user: ${regularUser.name} (${regularUser.id})`);
  
  // 2. Association admin
  const associationAdmin = await prisma.user.upsert({
    where: { email: 'association-admin@example.com' },
    update: { 
      role: UserRole.ASSOCIATION_ADMIN,
      name: 'Association Admin',
    },
    create: {
      email: 'association-admin@example.com',
      name: 'Association Admin',
      role: UserRole.ASSOCIATION_ADMIN,
    },
  });
  console.log(`Created association admin: ${associationAdmin.name} (${associationAdmin.id})`);
  
  // 3. Platform admin
  const platformAdmin = await prisma.user.upsert({
    where: { email: 'platform-admin@example.com' },
    update: { 
      role: UserRole.PLATFORM_ADMIN,
      name: 'Platform Admin',
    },
    create: {
      email: 'platform-admin@example.com',
      name: 'Platform Admin',
      role: UserRole.PLATFORM_ADMIN,
    },
  });
  console.log(`Created platform admin: ${platformAdmin.name} (${platformAdmin.id})`);

  // Create a test association
  const testAssociation = await prisma.association.upsert({
    where: { id: 'test-association-1' },
    update: {
      location: 'Test Location',
      population: 5,
      ownerId: associationAdmin.id,
    },
    create: {
      id: 'test-association-1',
      location: 'Test Location',
      population: 5,
      ownerId: associationAdmin.id,
    },
  });
  console.log(`Created test association: ${testAssociation.id}`);
  
  // Add association admin as admin
  await prisma.association.update({
    where: { id: testAssociation.id },
    data: {
      admins: {
        connect: { id: associationAdmin.id }
      }
    }
  });
  
  // Create weaver profiles
  const regularWeaver = await prisma.weaver.upsert({
    where: { userId: regularUser.id },
    update: {
      location: 'Regular User Location',
    },
    create: {
      userId: regularUser.id,
      location: 'Regular User Location',
    },
  });
  console.log(`Created regular weaver: ${regularWeaver.id}`);

  const adminWeaver = await prisma.weaver.upsert({
    where: { userId: associationAdmin.id },
    update: {
      location: 'Admin Location',
    },
    create: {
      userId: associationAdmin.id,
      location: 'Admin Location',
    },
  });
  console.log(`Created admin weaver: ${adminWeaver.id}`);
  
  // Create an approved application for the regular user
  const application = await prisma.application.upsert({
    where: { 
      id: 'test-application-1',
    },
    update: {
      status: 'APPROVED',
      approved: true,
      approvedById: associationAdmin.id,
    },
    create: {
      id: 'test-application-1',
      userId: regularUser.id,
      associationId: testAssociation.id,
      status: 'APPROVED',
      approved: true,
      approvedById: associationAdmin.id,
    },
  });
  console.log(`Created approved application: ${application.id}`);
  
  // Create a test event
  const testEvent = await prisma.event.upsert({
    where: { id: 'test-event-1' },
    update: {
      name: 'Test Event',
      location: 'Event Location',
      date: new Date('2025-07-15'),
      arrivalTime: new Date('2025-07-15T18:00:00'),
    },
    create: {
      id: 'test-event-1',
      name: 'Test Event',
      location: 'Event Location',
      associationId: testAssociation.id,
      date: new Date('2025-07-15'),
      arrivalTime: new Date('2025-07-15T18:00:00'),
    },
  });
  console.log(`Created test event: ${testEvent.id}`);
  
  console.log('\nTest Setup Complete!');
  console.log('\nManual Testing Instructions:');
  console.log('---------------------------');
  console.log('1. Run the development server: npm run dev');
  console.log('2. Test these scenarios with each user:');
  console.log('   - Regular User: user@example.com');
  console.log('   - Association Admin: association-admin@example.com');
  console.log('   - Platform Admin: platform-admin@example.com');
  console.log('\nTest URLs to try:');
  console.log('----------------');
  console.log('Public Routes:');
  console.log('- / (home)');
  console.log('- /weaver/register');
  console.log('- /weaver/apply');
  console.log('\nProtected Routes:');
  console.log('- /admin (platform admin only)');
  console.log('- /admin/associations (platform admin only)');
  console.log(`- /association/admin/${testAssociation.id} (association admin or platform admin)`);
  console.log(`- /association/${testAssociation.id} (members only)`);
  console.log(`- /events/${testEvent.id} (members only)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });