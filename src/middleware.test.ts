import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';
import { UserRole } from '@prisma/client';
import { auth } from '~/server/auth';

// Mock the auth module
jest.mock('~/server/auth', () => ({
  auth: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextResponse: {
      redirect: jest.fn().mockImplementation((url) => {
        return {
          url,
          status: 307,
          headers: new Headers({ location: url.toString() }),
        };
      }),
      next: jest.fn().mockImplementation(() => {
        return {
          status: 200,
          headers: new Headers(),
        };
      }),
    },
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin routes protection', () => {
    it('should redirect unauthenticated users to login', async () => {
      // Mock auth to return no session
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'));
      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl.toString()).toContain('/api/auth/signin');
    });

    it('should redirect non-admin users to unauthorized', async () => {
      // Mock auth to return regular user
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: UserRole.USER }
      });

      const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'));
      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl.toString()).toContain('/unauthorized');
    });

    it('should allow platform admins to access admin routes', async () => {
      // Mock auth to return platform admin
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: UserRole.PLATFORM_ADMIN }
      });

      const request = new NextRequest(new URL('http://localhost:3000/admin/dashboard'));
      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Association admin routes protection', () => {
    it('should redirect unauthenticated users to login', async () => {
      // Mock auth to return no session
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(new URL('http://localhost:3000/association/admin/123'));
      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl.toString()).toContain('/api/auth/signin');
    });

    it('should redirect regular users to unauthorized', async () => {
      // Mock auth to return regular user
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: UserRole.USER }
      });

      const request = new NextRequest(new URL('http://localhost:3000/association/admin/123'));
      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl.toString()).toContain('/unauthorized');
    });

    it('should allow association admins to access association admin routes', async () => {
      // Mock auth to return association admin
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: UserRole.ASSOCIATION_ADMIN }
      });

      const request = new NextRequest(new URL('http://localhost:3000/association/admin/123'));
      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow platform admins to access association admin routes', async () => {
      // Mock auth to return platform admin
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: UserRole.PLATFORM_ADMIN }
      });

      const request = new NextRequest(new URL('http://localhost:3000/association/admin/123'));
      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });

  describe('Weaver routes protection', () => {
    it('should allow access to weaver/register without authentication', async () => {
      // Mock auth to return no session
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(new URL('http://localhost:3000/weaver/register'));
      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should allow access to weaver/apply without authentication', async () => {
      // Mock auth to return no session
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(new URL('http://localhost:3000/weaver/apply'));
      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated users from protected weaver routes', async () => {
      // Mock auth to return no session
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(new URL('http://localhost:3000/weaver/status'));
      await middleware(request);

      expect(NextResponse.redirect).toHaveBeenCalled();
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0];
      expect(redirectUrl.toString()).toContain('/api/auth/signin');
    });

    it('should allow authenticated users to access protected weaver routes', async () => {
      // Mock auth to return regular user
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: '1', role: UserRole.USER }
      });

      const request = new NextRequest(new URL('http://localhost:3000/weaver/status'));
      await middleware(request);

      expect(NextResponse.next).toHaveBeenCalled();
      expect(NextResponse.redirect).not.toHaveBeenCalled();
    });
  });
});