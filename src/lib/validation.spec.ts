import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  loginSchema,
  nameSchema,
  passwordSchema,
  registerSchema,
} from './validation';

describe('Authentication Schemas Validation', () => {
  describe('emailSchema', () => {
    it('should pass valid emails and transform them', () => {
      const result = emailSchema.safeParse('  USER@Example.Com  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'plainaddress',
        '#@%^%#$@#$@#.com',
        '@example.com',
        'joe@example.',
      ];
      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should reject empty or too long emails', () => {
      expect(emailSchema.safeParse('').success).toBe(false);
      expect(emailSchema.safeParse('a'.repeat(255) + '@test.com').success).toBe(
        false
      );
    });
  });

  describe('passwordSchema', () => {
    it('should accept strong passwords', () => {
      expect(passwordSchema.safeParse('Password123').success).toBe(true);
      expect(passwordSchema.safeParse('vEry$tr0ngP4ss').success).toBe(true);
    });

    it('should fail if missing requirements', () => {
      const cases = [
        { pass: 'short1A', error: 'at least 8 characters' },
        { pass: 'nonumbersPass', error: 'at least one number' },
        { pass: 'ONLYUPPER123', error: 'lowercase letter' },
        { pass: 'onlylower123', error: 'uppercase letter' },
      ];

      cases.forEach(({ pass, error }) => {
        const result = passwordSchema.safeParse(pass);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain(error);
        }
      });
    });
  });

  describe('nameSchema', () => {
    it('should allow valid names and trim them', () => {
      const result = nameSchema.safeParse("  O'Connor-Smith  ");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("O'Connor-Smith");
      }
    });

    it('should transform empty string to undefined', () => {
      const result = nameSchema.safeParse('');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeUndefined();
      }
    });

    it('should reject names with numbers or special symbols', () => {
      expect(nameSchema.safeParse('John123').success).toBe(false);
      expect(nameSchema.safeParse('John @ Smith').success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const valid = { email: 'test@test.com', password: 'any-password' };
      expect(loginSchema.safeParse(valid).success).toBe(true);
    });

    it('should require email and password', () => {
      const result = loginSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate full registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept empty name in registration', () => {
      const dataWithoutName = {
        name: '',
        email: 'john@example.com',
        password: 'Password123',
      };
      const result = registerSchema.safeParse(dataWithoutName);
      expect(result.success).toBe(true);
    });

    it('should fail registration with weak password', () => {
      const weakData = {
        email: 'john@example.com',
        password: '123',
      };
      expect(registerSchema.safeParse(weakData).success).toBe(false);
    });
  });
});
