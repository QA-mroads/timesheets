import winston from 'winston'

import config, { logLevelTest, outputLocation } from '../../../../playwright.config'

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
}

winston.addColors(colors)

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'MM-DD-YYYY HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(info => {
        return `${info.timestamp}: ${info.message}`
    }),
)

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'MM-DD-YYYY HH:mm:ss' }),
    winston.format.printf(info => {
        return `${info.timestamp}: ${info.message}`
    }),
)

const transports = [
    new winston.transports.Console({
        format: consoleFormat,
    }),
    new winston.transports.File({ format: fileFormat, filename: `${outputLocation}tests.log` }),
]

const log = winston.createLogger({
    levels,
    transports,
    level: logLevelTest.toLowerCase(),
})

export default log
