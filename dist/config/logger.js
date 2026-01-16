"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("./env");
const levelOrder = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
function getLevel() {
    const raw = process.env.LOG_LEVEL;
    const v = typeof raw === 'string' ? raw.trim().toLowerCase() : undefined;
    if (v === 'debug' || v === 'info' || v === 'warn' || v === 'error')
        return v;
    return env_1.env.isProduction ? 'info' : 'debug';
}
const current = getLevel();
function shouldLog(level) {
    return levelOrder[level] >= levelOrder[current];
}
exports.logger = {
    debug: (...args) => {
        if (shouldLog('debug'))
            console.debug(...args);
    },
    info: (...args) => {
        if (shouldLog('info'))
            console.info(...args);
    },
    warn: (...args) => {
        if (shouldLog('warn'))
            console.warn(...args);
    },
    error: (...args) => {
        if (shouldLog('error'))
            console.error(...args);
    },
};
//# sourceMappingURL=logger.js.map