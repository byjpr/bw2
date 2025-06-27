import { UserRole } from '@prisma/client';
import type { User } from 'next-auth';
import { db } from '~/server/db';

/**
 * Check if a user is a platform admin
 */
export function isPlatformAdmin(user: User | undefined | null): boolean {
  if (!user) return false;
  return user.role === UserRole.PLATFORM_ADMIN;
}

/**
 * Check if a user is an association admin
 */
export function isAssociationAdmin(user: User | undefined | null): boolean {
  if (!user) return false;
  return user.role === UserRole.PLATFORM_ADMIN || user.role === UserRole.ASSOCIATION_ADMIN;
}

/**
 * Check if a user is an admin of a specific association
 */
export async function isAdminOfAssociation(
  userId: string | undefined | null, 
  associationId: string
): Promise<boolean> {
  if (!userId) return false;
  
  // Platform admins have access to all associations
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  if (user?.role === UserRole.PLATFORM_ADMIN) {
    return true;
  }
  
  // Check if user is an admin or owner of this specific association
  const association = await db.association.findFirst({
    where: {
      id: associationId,
      OR: [
        { ownerId: userId },
        { admins: { some: { id: userId } } }
      ]
    }
  });
  
  return !!association;
}

/**
 * Check if a user is a member of an association
 */
export async function isAssociationMember(
  userId: string | undefined | null, 
  associationId: string
): Promise<boolean> {
  if (!userId) return false;
  
  // Check admin status first (admins are also members)
  const isAdmin = await isAdminOfAssociation(userId, associationId);
  if (isAdmin) return true;
  
  // Check if user has an approved application to this association
  const application = await db.application.findFirst({
    where: {
      userId,
      associationId,
      status: 'APPROVED',
      approved: true
    }
  });
  
  return !!application;
}

/**
 * Check if user has permission to manage an event
 */
export async function canManageEvent(
  userId: string | undefined | null, 
  eventId: string
): Promise<boolean> {
  if (!userId) return false;
  
  // Get the event with its association
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { association: true }
  });
  
  if (!event) return false;
  
  // Check if user is admin of the association that owns this event
  return isAdminOfAssociation(userId, event.associationId);
}

/**
 * Check if user has permission to attend an event
 */
export async function canAttendEvent(
  userId: string | undefined | null, 
  eventId: string
): Promise<boolean> {
  if (!userId) return false;
  
  // Get the event with its association
  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { association: true }
  });
  
  if (!event) return false;
  
  // Check if user is a member of the association that owns this event
  return isAssociationMember(userId, event.associationId);
}