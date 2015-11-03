var IsoLogger = require('isologger');
var IsoLoggerWeb = require('isologger-web');

if ('undefined' !== typeof window || 1) {
    // browser

    var logger = new IsoLogger.Logger({
        lineNumbers: true,
        timestamps: true
    });
    logger.addOutput('debug', new IsoLogger.ConsoleOutput());
    logger.addOutput('debug', new IsoLoggerWeb.AjaxJQueryOutput());
    module.exports = logger;

} else {
    //node

    var winston = require('winston');

    module.exports = new winston.Logger({
        level: 'info',
        transports: [
            new (winston.transports.Console)(),
            new (winston.transports.File)({filename: 'updog.log'})
        ]
    });
}

