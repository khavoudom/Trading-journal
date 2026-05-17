import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '@/config/index.js';
import { DEFAULT_PLAN, PLAN_TEMPLATES } from '@/config/defaultPlan.js';
import { userRepository } from '@/repositories/userRepository.js';
import { getPrisma } from '@/database/prisma.js';
import { validate } from '@/validation/index.js';
import { registerSchema, loginSchema, updateProfileSchema } from '@/validation/authSchemas.js';
import { AppError } from '@/errors/AppError.js';
import { logger } from '@/utils/logger.js';

/** Business logic for user authentication and profile management. */
export const authService = {
  /**
   * Creates a new user account with a default space and trading plan.
   * Returns user data, JWT, and the default space ID.
   */
  register: async (input: { email: string; password: string; username: string }) => {
    logger.info('AuthService', 'Register attempt', input.email);

    const data = validate(registerSchema, input);
    logger.debug('AuthService', 'Register input validated', data.email);

    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      logger.warn('AuthService', 'Register failed: email already exists', data.email);
      throw new AppError('User already exists with this email', 400);
    }
    logger.debug('AuthService', 'Email is available', data.email);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const userId = uuidv4();
    const createdAt = new Date();
    const defaultSpaceId = uuidv4();
    logger.debug('AuthService', 'Starting transaction for user creation', userId);

    try {
      await getPrisma().$transaction(async (tx) => {
        logger.debug('AuthService', 'Creating user record', userId);
        await tx.user.create({
          data: {
            id: userId,
            email: data.email,
            password: hashedPassword,
            username: data.username,
            createdAt,
          },
        });
        logger.debug('AuthService', 'Creating default space', defaultSpaceId);
        await tx.space.create({
          data: { id: defaultSpaceId, userId, name: 'Main Account', createdAt },
        });
        logger.debug('AuthService', 'Creating default plan', userId);
        await tx.planRule.createMany({
          data: PLAN_TEMPLATES.map((template) => ({
            userId,
            spaceId: defaultSpaceId,
            template,
            content: DEFAULT_PLAN[template],
          })),
        });
      });
    } catch (err: any) {
      logger.error('AuthService', 'Transaction failed during registration', err.message);
      throw new AppError('Registration failed. Please try again.', 500);
    }

    logger.debug('AuthService', 'Transaction completed, generating token', userId);

    const token = jwt.sign({ id: userId, email: data.email }, config.jwtSecret, {
      expiresIn: '24h',
    });

    logger.info('AuthService', 'Register successful', userId);

    return {
      user: {
        id: userId,
        email: data.email,
        username: data.username,
        createdAt: createdAt.toISOString(),
      },
      token,
      defaultSpaceId,
    };
  },

  /**
   * Authenticates a user by email and password, returning a JWT on success.
   */
  login: async (input: { email: string; password: string }) => {
    logger.info('AuthService', 'Login attempt', input.email);

    const data = validate(loginSchema, input);
    logger.debug('AuthService', 'Login input validated', input.email);

    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      logger.warn('AuthService', 'Login failed: user not found', input.email);
      throw new AppError('Invalid email or password', 401);
    }
    logger.debug('AuthService', 'User found', user.id);

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      logger.warn('AuthService', 'Login failed: password mismatch', user.id);
      throw new AppError('Invalid email or password', 401);
    }
    logger.debug('AuthService', 'Password verified', user.id);

    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: '24h',
    });
    logger.info('AuthService', 'Login successful', user.id);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  /**
   * Returns the user profile for the given ID.
   */
  getProfile: async (userId: string) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return { user };
  },

  /**
   * Updates user profile fields including username, email, and password.
   * Requires currentPassword when setting a newPassword.
   */
  updateProfile: async (
    userId: string,
    input: {
      username?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) => {
    validate(updateProfileSchema, input);

    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updates: { email?: string; username?: string; password?: string } = {};

    if (input.username) {
      updates.username = input.username;
    }

    if (input.email && input.email !== user.email) {
      const emailInUse = await userRepository.existsByEmail(input.email, userId);
      if (emailInUse) {
        throw new AppError('Email already in use', 400);
      }
      updates.email = input.email;
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new AppError('Current password required', 400);
      }
      const isMatch = await bcrypt.compare(input.currentPassword, user.password);
      if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
      }
      const hashed = await bcrypt.hash(input.newPassword, 10);
      updates.password = hashed;
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError('Nothing to update', 400);
    }

    await userRepository.update(userId, updates);

    const updated = await userRepository.findById(userId);
    return { user: updated };
  },

  /**
   * Verifies a user's password. Returns true if the password matches.
   */
  verifyPassword: async (userId: string, password: string) => {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return bcrypt.compare(password, user.password);
  },

  /**
   * Deletes a user account and all associated data (spaces, trades, plans).
   */
  deleteAccount: async (userId: string) => {
    await getPrisma().$transaction(async (tx) => {
      await tx.planRule.deleteMany({ where: { userId } });
      await tx.trade.deleteMany({ where: { userId } });
      await tx.space.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });
  },
};
