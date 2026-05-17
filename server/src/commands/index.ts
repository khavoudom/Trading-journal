import 'dotenv/config';
import { getPrisma, disconnectPrisma } from '@/database/prisma.js';
import { logger } from '@/utils/logger.js';

type CommandHandler = (args: string[]) => Promise<void>;

interface Command {
  name: string;
  description: string;
  handler: CommandHandler;
}

const commands: Command[] = [];

function register(command: Command) {
  commands.push(command);
}

// ── schedule:clear ──────────────────────────────────────────────
register({
  name: 'schedule:clear',
  description: 'Delete all calendar events, drawings, and drawing board drawings.',
  async handler(_args: string[]) {
    const prisma = getPrisma();

    logger.info('CMD', 'Deleting all drawing board drawings...');
    const deletedBoardDrawings = await prisma.drawingBoardDrawing.deleteMany();
    logger.info('CMD', `  → ${deletedBoardDrawings.count} drawing board drawings deleted`);

    logger.info('CMD', 'Deleting all calendar drawings...');
    const deletedCalendarDrawings = await prisma.calendarDrawing.deleteMany();
    logger.info('CMD', `  → ${deletedCalendarDrawings.count} calendar drawings deleted`);

    logger.info('CMD', 'Deleting all calendar events...');
    const deletedEvents = await prisma.calendarEvent.deleteMany();
    logger.info('CMD', `  → ${deletedEvents.count} calendar events deleted`);

    logger.info('CMD', 'Schedule cleared successfully.');
  },
});

// ── Runner ──────────────────────────────────────────────────────
async function main() {
  const [, , commandName, ...args] = process.argv;

  if (!commandName || commandName === 'list') {
    console.log('\n  Available commands:\n');
    for (const cmd of commands) {
      console.log(`  ${cmd.name.padEnd(28)} ${cmd.description}`);
    }
    console.log();
    process.exit(0);
  }

  const cmd = commands.find((c) => c.name === commandName);
  if (!cmd) {
    console.error(`\n  Unknown command: "${commandName}"`);
    console.error('  Run "artisan list" to see available commands.\n');
    process.exit(1);
  }

  try {
    await cmd.handler(args);
  } catch (err) {
    logger.error('CMD', 'Command failed: %O', err);
    process.exit(1);
  } finally {
    await disconnectPrisma();
  }
}

main();
