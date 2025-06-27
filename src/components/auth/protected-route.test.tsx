import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute, PlatformAdminRoute, AssociationAdminRoute } from './protected-route';
import { UserRole } from '@prisma/client';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ProtectedRoute Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });
  
  it('should show loading state when session is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });
    
    render(
      <ProtectedRoute loading={<div>Custom Loading...</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should redirect to login when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(mockPush).toHaveBeenCalledWith('/api/auth/signin');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
  
  it('should render children when authenticated with no role requirement', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.USER }
      },
      status: 'authenticated',
    });
    
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
  
  it('should redirect to unauthorized when role requirement not met', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.USER }
      },
      status: 'authenticated',
    });
    
    render(
      <ProtectedRoute requiredRole={UserRole.PLATFORM_ADMIN}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    
    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });
  
  it('should render children when role requirement is met', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.PLATFORM_ADMIN }
      },
      status: 'authenticated',
    });
    
    render(
      <ProtectedRoute requiredRole={UserRole.PLATFORM_ADMIN}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

describe('PlatformAdminRoute Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });
  
  it('should allow platform admins', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.PLATFORM_ADMIN }
      },
      status: 'authenticated',
    });
    
    render(
      <PlatformAdminRoute>
        <div>Platform Admin Content</div>
      </PlatformAdminRoute>
    );
    
    expect(screen.getByText('Platform Admin Content')).toBeInTheDocument();
  });
  
  it('should redirect association admins', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.ASSOCIATION_ADMIN }
      },
      status: 'authenticated',
    });
    
    render(
      <PlatformAdminRoute>
        <div>Platform Admin Content</div>
      </PlatformAdminRoute>
    );
    
    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
  });
});

describe('AssociationAdminRoute Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });
  
  it('should allow platform admins', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.PLATFORM_ADMIN }
      },
      status: 'authenticated',
    });
    
    render(
      <AssociationAdminRoute>
        <div>Association Admin Content</div>
      </AssociationAdminRoute>
    );
    
    expect(screen.getByText('Association Admin Content')).toBeInTheDocument();
  });
  
  it('should allow association admins', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.ASSOCIATION_ADMIN }
      },
      status: 'authenticated',
    });
    
    render(
      <AssociationAdminRoute>
        <div>Association Admin Content</div>
      </AssociationAdminRoute>
    );
    
    expect(screen.getByText('Association Admin Content')).toBeInTheDocument();
  });
  
  it('should redirect regular users', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', role: UserRole.USER }
      },
      status: 'authenticated',
    });
    
    render(
      <AssociationAdminRoute>
        <div>Association Admin Content</div>
      </AssociationAdminRoute>
    );
    
    expect(mockPush).toHaveBeenCalledWith('/unauthorized');
  });
});