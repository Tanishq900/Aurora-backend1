"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const logger_1 = require("../config/logger");
function notFound(req, res) {
    res.status(404).json({ error: 'Not found' });
}
function errorHandler(err, req, res, next) {
    const status = typeof err?.status === 'number' ? err.status : 500;
    const message = typeof err?.message === 'string' && err.message.trim() ? err.message : 'Internal server error';
    logger_1.logger.error('Request failed', {
        method: req.method,
        path: req.originalUrl,
        status,
        message,
    });
    if (status >= 500) {
        logger_1.logger.error(err);
    }
    res.status(status).json({ error: status >= 500 ? 'Internal server error' : message });
}
//# sourceMappingURL=error.js.map