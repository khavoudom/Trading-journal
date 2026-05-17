import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '@/config/index.js';
import { logger } from '@/utils/logger.js';

let io: Server | null = null;

export const setupSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token as string, config.jwtSecret) as { id: string };
      (socket as any).userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    logger.info('SOCKET', 'User %s connected', userId);

    socket.on('disconnect', () => {
      logger.info('SOCKET', 'User %s disconnected', userId);
    });
  });

  logger.info('SOCKET', 'Socket.IO initialized');
  return io;
};

export const getIO = () => io;
