import pino from 'pino';
import path from 'path';
import fs from 'fs';

const LOG_FILE_PATH = path.join(process.cwd(), 'logs', 'app.log');

if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';
export const logger = isProduction
    ? pino( //If in production, log to file and console
        { level: 'info' },
        pino.multistream([
            { stream: process.stdout },
            { stream: pino.destination({ dest: LOG_FILE_PATH, sync: false }) },
        ])
    )
    : pino({ //If not in production, just log to console with pretty colors
        level: 'debug',
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    });

if(isProduction) logger.info(`Logging to: ${LOG_FILE_PATH}`);
