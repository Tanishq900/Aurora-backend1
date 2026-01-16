"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const sos_routes_1 = __importDefault(require("./routes/sos.routes"));
const presentation_routes_1 = __importDefault(require("./routes/presentation.routes"));
const risk_zones_routes_1 = __importDefault(require("./routes/risk-zones.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const handlers_1 = require("./sockets/handlers");
const cors_2 = require("./config/cors");
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const error_1 = require("./middlewares/error");
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const httpServer = (0, http_1.createServer)(app);
const corsOptions = (0, cors_2.createCorsOptions)();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.env.corsOrigins(),
        credentials: true,
    },
});
const PORT = env_1.env.port();
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static('uploads'));
// Make io available to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/sos', sos_routes_1.default);
app.use('/api/presentation', presentation_routes_1.default);
app.use('/api/risk-zones', risk_zones_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use(error_1.notFound);
// Error handling
app.use(error_1.errorHandler);
// Setup Socket.io handlers
(0, handlers_1.setupSocketHandlers)(io);
// Start server
httpServer.listen(PORT, () => {
    logger_1.logger.info(`Aurora Sentinel Backend running on port ${PORT}`);
    logger_1.logger.info(`WebSocket server ready`);
    logger_1.logger.info(`CORS enabled for: ${env_1.env.corsOrigins().join(', ')}`);
});
//# sourceMappingURL=index.js.map