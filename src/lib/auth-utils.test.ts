import { UserRole } from '@prisma/client';
import { isPlatformAdmin, isAssociationAdmin } from './auth-utils';

// Mock user objects
const platformAdmin = { id: '1', name: 'Admin', role: UserRole.PLATFORM_ADMIN };
const associationAdmin = { id: '2', name: 'Assoc Admin', role: UserRole.ASSOCIATION_ADMIN };
const regularUser = { id: '3', name: 'Regular', role: UserRole.USER };

describe('Auth Utilities', () => {
  describe('isPlatformAdmin', () => {
    it('should return true for platform admins', () => {
      expect(isPlatformAdmin(platformAdmin)).toBe(true);
    });

    it('should return false for association admins', () => {
      expect(isPlatformAdmin(associationAdmin)).toBe(false);
    });

    it('should return false for regular users', () => {
      expect(isPlatformAdmin(regularUser)).toBe(false);
    });

    it('should return false for undefined or null users', () => {
      expect(isPlatformAdmin(undefined)).toBe(false);
      expect(isPlatformAdmin(null)).toBe(false);
    });
  });

  describe('isAssociationAdmin', () => {
    it('should return true for platform admins', () => {
      expect(isAssociationAdmin(platformAdmin)).toBe(true);
    });

    it('should return true for association admins', () => {
      expect(isAssociationAdmin(associationAdmin)).toBe(true);
    });

    it('should return false for regular users', () => {
      expect(isAssociationAdmin(regularUser)).toBe(false);
    });

    it('should return false for undefined or null users', () => {
      expect(isAssociationAdmin(undefined)).toBe(false);
      expect(isAssociationAdmin(null)).toBe(false);
    });
  });
});