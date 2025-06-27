'use client';

import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { isPlatformAdmin, isAssociationAdmin } from '~/lib/auth-utils';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  loading?: ReactNode;
}

/**
 * Component to protect routes based on user authentication and role
 */
export function ProtectedRoute({ 
  children, 
  requiredRole,
  loading = <div className="flex items-center justify-center min-h-screen">Loading...</div>
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Check authorization when session status changes
    if (status === 'loading') return;
    
    if (!session) {
      // Not logged in, redirect to login
      router.push('/api/auth/signin');
      return;
    }
    
    if (requiredRole) {
      // Check if user has the required role
      switch (requiredRole) {
        case UserRole.PLATFORM_ADMIN:
          if (!isPlatformAdmin(session.user)) {
            router.push('/unauthorized');
            return;
          }
          break;
        case UserRole.ASSOCIATION_ADMIN:
          if (!isAssociationAdmin(session.user)) {
            router.push('/unauthorized');
            return;
          }
          break;
        default:
          // USER role - just being authenticated is enough
          break;
      }
    }
    
    setAuthorized(true);
  }, [session, status, requiredRole, router]);
  
  // Show loading indicator while checking auth
  if (status === 'loading' || !authorized) {
    return <>{loading}</>;
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
}

/**
 * Specific component for platform admin routes
 */
export function PlatformAdminRoute({ children, loading }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={UserRole.PLATFORM_ADMIN} loading={loading}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Specific component for association admin routes
 */
export function AssociationAdminRoute({ children, loading }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole={UserRole.ASSOCIATION_ADMIN} loading={loading}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Component for routes that require any authenticated user
 */
export function AuthenticatedRoute({ children, loading }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute loading={loading}>
      {children}
    </ProtectedRoute>
  );
}