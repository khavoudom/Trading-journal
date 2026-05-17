import * as cron from 'node-cron';
import { scheduleTaskService } from '@/services/scheduleTaskService.js';
import { emailService } from '@/services/emailService.js';
import { getIO } from '@/socket/index.js';
import { logger } from '@/utils/logger.js';

let cronJob: cron.ScheduledTask | null = null;

export const startReminderQueue = () => {
  logger.info('REMINDER', 'Starting reminder queue (every minute)');

  cronJob = cron.schedule('* * * * *', async () => {
    try {
      const due = await scheduleTaskService.processReminders();

      if (due.length === 0) return;

      logger.info('REMINDER', '%d task(s) due for reminder', due.length);

      for (const task of due) {
        // Emit Socket.IO event
        const io = getIO();
        if (io) {
          io.to(`user:${task.userId}`).emit('task-reminder', {
            id: task.id,
            title: task.title,
            time: task.time,
            timeEnd: task.timeEnd,
            taskDate: task.taskDate,
            type: task.type,
          });
        }

        // Send email
        const userEmail = (task as any).user?.email;
        if (userEmail) {
          await emailService.sendReminder(userEmail, task.title, task.time);
        }
      }
    } catch (err) {
      logger.error('REMINDER', 'Error processing reminders: %O', err);
    }
  });
};

export const stopReminderQueue = () => {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    logger.info('REMINDER', 'Reminder queue stopped');
  }
};
