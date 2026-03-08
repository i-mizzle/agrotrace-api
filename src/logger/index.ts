const pino = require('pino')
const log = pino({
  transport: {
    target: 'pino-pretty'
  },
})

// const log = pino({
//   level: 'info', // Set the desired log level (e.g., info, debug, error)
//   timestamp: pino.stdTimeFunctions.isoTime, // Customize the timestamp format
//   prettyPrint: {
//     colorize: true, // Add colors to the pretty-printed logs
//   },
// }, pino.destination('./logs.log')); // Specify the file path for log output

// export default log;

import winston from 'winston';

export const winstonLog = winston.createLogger({
  level: 'info', // Set the desired log level (e.g., info, debug, error)
  format: winston.format.json(), // Use JSON format for log entries
  transports: [
    new winston.transports.Console(), // Output logs to the console
    new winston.transports.File({ filename: 'logs.log' }), // Output logs to a file
  ],
});

export default log