"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorsOptions = createCorsOptions;
const env_1 = require("./env");
function createCorsOptions() {
    const allowlist = new Set(env_1.env.corsOrigins());
    return {
        credentials: true,
        origin(origin, callback) {
            if (!origin)
                return callback(null, true);
            if (allowlist.has(origin))
                return callback(null, true);
            return callback(null, false);
        },
    };
}
//# sourceMappingURL=cors.js.map