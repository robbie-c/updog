var mongoose = require('mongoose');

var clientLogDumpSchema = mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    referrer: String,
    serverTimestamp: Date,
    logs: [
        {
            level: String,
            args: [
                {}
            ],
            functionName: String,
            fileName: String,
            lineNumber: Number,
            columnNumber: Number,
            timestamp: Date
        }
    ]
});

var ClientLogDump = mongoose.model('ClientLogDump', clientLogDumpSchema);

module.exports = ClientLogDump;
