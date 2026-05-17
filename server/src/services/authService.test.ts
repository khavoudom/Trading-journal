import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/errors/AppError.js';

// Mock all external dependencies
vi.mock('@/repositories/userRepository.js', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findByIdWithPassword: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    existsByEmail: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/validation/index.js', () => ({
  validate: vi.fn(),
}));

vi.mock('@/database/prisma.js', () => ({
  getPrisma: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
  hash: vi.fn(),
  compare: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
  sign: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

vi.mock('@/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  requestLogger: vi.fn(),
}));

import { authService } from '@/services/authService.js';
import { userRepository } from '@/repositories/userRepository.js';
import { validate } from '@/validation/index.js';
import { getPrisma } from '@/database/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed-password-123',
  createdAt: new Date('2024-01-01'),
};

const mockUserWithoutPassword = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockUserWithoutPasswordRaw = {
  ...mockUserWithoutPassword,
  createdAt: new Date('2024-01-01') as any,
};

const mockToken = 'fake-jwt-token';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock: validation passes through
    vi.mocked(validate).mockImplementation((_schema: any, data: any) => data);
    // Default mock: uuid returns fixed ID
    vi.mocked(uuidv4).mockReturnValue('fixed-uuid-abc');
    // Default mock: bcrypt.hash returns fixed hash
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password-123' as never);
    // Default mock: jwt.sign returns fake token
    vi.mocked(jwt.sign).mockReturnValue(mockToken as any);
  });

  describe('register', () => {
    const registerInput = {
      email: 'new@example.com',
      password: 'password123',
      username: 'newuser',
    };

    it('creates a new user and returns user + token + defaultSpaceId', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      const mockTx = {
        user: { create: vi.fn() },
        space: { create: vi.fn() },
        planRule: { createMany: vi.fn() },
      };
      vi.mocked(getPrisma).mockReturnValue({ $transaction: vi.fn((cb: any) => cb(mockTx)) } as any);

      const result = await authService.register(registerInput);

      expect(validate).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(getPrisma().$transaction).toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockTx.space.create).toHaveBeenCalled();
      expect(mockTx.planRule.createMany).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          id: 'fixed-uuid-abc',
          email: 'new@example.com',
          username: 'newuser',
          createdAt: expect.any(String),
        },
        token: mockToken,
        defaultSpaceId: expect.any(String),
      });
    });

    it('throws when email already exists', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(authService.register(registerInput)).rejects.toThrow(AppError);
      await expect(authService.register(registerInput)).rejects.toThrow(
        'User already exists with this email',
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('throws when validation fails', async () => {
      vi.mocked(validate).mockImplementation(() => {
        throw new AppError('Validation failed', 400);
      });

      await expect(authService.register(registerInput)).rejects.toThrow(AppError);
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('handles transaction failure gracefully', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(getPrisma).mockReturnValue({
        $transaction: vi.fn(() => Promise.reject(new Error('DB error'))),
      } as any);

      await expect(authService.register(registerInput)).rejects.toThrow(AppError);
      await expect(authService.register(registerInput)).rejects.toThrow(
        'Registration failed. Please try again.',
      );
    });
  });

  describe('login', () => {
    const loginInput = { email: 'test@example.com', password: 'password123' };

    it('returns user and token for correct credentials', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.login(loginInput);

      expect(validate).toHaveBeenCalled();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password-123');
      expect(result).toEqual({
        user: mockUserWithoutPasswordRaw,
        token: mockToken,
      });
    });

    it('throws when user is not found', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
    });

    it('throws when password is incorrect', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login(loginInput)).rejects.toThrow(AppError);
      await expect(authService.login(loginInput)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getProfile', () => {
    it('returns user profile', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(mockUserWithoutPassword as any);

      const result = await authService.getProfile('user-1');

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ user: mockUserWithoutPassword });
    });

    it('throws when user not found', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(authService.getProfile('nonexistent')).rejects.toThrow(AppError);
      await expect(authService.getProfile('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('updates username', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);
      vi.mocked(userRepository.findById).mockResolvedValue({
        ...mockUserWithoutPassword,
        username: 'newusername',
      } as any);

      const result = await authService.updateProfile('user-1', { username: 'newusername' });

      expect(userRepository.update).toHaveBeenCalledWith('user-1', { username: 'newusername' });
      expect(result.user!.username).toBe('newusername');
    });

    it('checks email uniqueness when changing email', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);
      vi.mocked(userRepository.existsByEmail).mockResolvedValue(true);
      vi.mocked(userRepository.findById).mockResolvedValue(mockUserWithoutPassword as any);

      await expect(
        authService.updateProfile('user-1', { email: 'taken@example.com' }),
      ).rejects.toThrow(AppError);
      await expect(
        authService.updateProfile('user-1', { email: 'taken@example.com' }),
      ).rejects.toThrow('Email already in use');
    });

    it('requires currentPassword when setting newPassword', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);

      await expect(
        authService.updateProfile('user-1', { newPassword: 'newpass123' }),
      ).rejects.toThrow(AppError);
      await expect(
        authService.updateProfile('user-1', { newPassword: 'newpass123' }),
      ).rejects.toThrow('Current password required');
    });

    it('verifies currentPassword before setting newPassword', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.updateProfile('user-1', {
          currentPassword: 'wrong',
          newPassword: 'newpass123',
        }),
      ).rejects.toThrow(AppError);
      await expect(
        authService.updateProfile('user-1', {
          currentPassword: 'wrong',
          newPassword: 'newpass123',
        }),
      ).rejects.toThrow('Current password is incorrect');
    });

    it('throws when no updates provided', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);

      await expect(authService.updateProfile('user-1', {})).rejects.toThrow(AppError);
      await expect(authService.updateProfile('user-1', {})).rejects.toThrow('Nothing to update');
    });

    it('throws when user not found', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(null);

      await expect(authService.updateProfile('nonexistent', { username: 'new' })).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('verifyPassword', () => {
    it('returns true when password matches', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.verifyPassword('user-1', 'correct-password');
      expect(result).toBe(true);
    });

    it('returns false when password does not match', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await authService.verifyPassword('user-1', 'wrong-password');
      expect(result).toBe(false);
    });

    it('throws when user not found', async () => {
      vi.mocked(userRepository.findByIdWithPassword).mockResolvedValue(null);

      await expect(authService.verifyPassword('nonexistent', 'pwd')).rejects.toThrow(
        'User not found',
      );
    });
  });
});
