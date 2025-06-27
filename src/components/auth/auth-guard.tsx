import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { UserRole } from '@prisma/client';
import { auth } from '~/server/auth';
import { isPlatformAdmin, isAssociationAdmin, isAdminOfAssociation } from '~/lib/auth-utils';

interface AuthGuardProps {
  children: ReactNode;
}

interface RoleGuardProps extends AuthGuardProps {
  requiredRole: UserRole;
}

interface AssociationGuardProps extends AuthGuardProps {
  associationId: string;
}

/**
 * Server component to protect routes with authentication
 */
export async function AuthGuard({ children }: AuthGuardProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }
  
  return <>{children}</>;
}

/**
 * Server component to protect routes with role-based authorization
 */
export async function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }
  
  let hasRequiredRole = false;
  
  switch (requiredRole) {
    case UserRole.PLATFORM_ADMIN:
      hasRequiredRole = isPlatformAdmin(session.user);
      break;
    case UserRole.ASSOCIATION_ADMIN:
      hasRequiredRole = isAssociationAdmin(session.user);
      break;
    default:
      // USER role - just being authenticated is enough
      hasRequiredRole = true;
      break;
  }
  
  if (!hasRequiredRole) {
    redirect('/unauthorized');
  }
  
  return <>{children}</>;
}

/**
 * Server component to protect routes that require association admin permissions
 */
export async function AssociationAdminGuard({ children, associationId }: AssociationGuardProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }
  
  const isAdmin = await isAdminOfAssociation(session.user.id, associationId);
  
  if (!isAdmin) {
    redirect('/unauthorized');
  }
  
  return <>{children}</>;
}

/**
 * Helper components with specific roles
 */
export async function PlatformAdminGuard({ children }: AuthGuardProps) {
  return <RoleGuard requiredRole={UserRole.PLATFORM_ADMIN}>{children}</RoleGuard>;
}

export async function AssociationAdminRoleGuard({ children }: AuthGuardProps) {
  return <RoleGuard requiredRole={UserRole.ASSOCIATION_ADMIN}>{children}</RoleGuard>;
}