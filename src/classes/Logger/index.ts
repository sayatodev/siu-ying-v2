import winston from "winston";

// Using winston to log messages to the console
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'siuying.log'})
    ],
});

export default logger;
