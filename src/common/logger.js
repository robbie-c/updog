import winston from "winston";

if ('undefined' === typeof window) {
    winston.add(winston.transports.File, { filename: 'updog.log' });
}

export default winston;

