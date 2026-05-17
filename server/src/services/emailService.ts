import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger.js';

const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      })
    : null;

if (!transporter) {
  logger.warn(
    'EMAIL',
    'Gmail not configured — email sending disabled. Set GMAIL_USER and GMAIL_APP_PASSWORD',
  );
}

export const emailService = {
  sendReminder: async (to: string, taskTitle: string, taskTime?: string | null) => {
    if (!transporter) {
      logger.info(
        'EMAIL',
        '[DEV] Would send reminder email to %s for task "%s" at %s',
        to,
        taskTitle,
        taskTime ?? 'all day',
      );
      return;
    }

    try {
      await transporter.sendMail({
        from: `"Trading Journal" <${GMAIL_USER}>`,
        to,
        subject: `Reminder: ${taskTitle}`,
        text: `Reminder for your task: "${taskTitle}"${taskTime ? ` at ${taskTime}` : ''}`,
        html: `<p>Reminder for your task: <strong>${taskTitle}</strong>${taskTime ? ` at <strong>${taskTime}</strong>` : ''}</p>`,
      });
      logger.info('EMAIL', 'Reminder email sent to %s for "%s"', to, taskTitle);
    } catch (err) {
      logger.error('EMAIL', 'Failed to send email: %O', err);
    }
  },
};
