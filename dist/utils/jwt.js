"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const accessSecret = env_1.env.jwtAccessSecret();
const refreshSecret = env_1.env.jwtRefreshSecret();
const accessExpiry = env_1.env.jwtAccessExpiry();
const refreshExpiry = env_1.env.jwtRefreshExpiry();
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, accessSecret, {
        expiresIn: accessExpiry,
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, refreshSecret, {
        expiresIn: refreshExpiry,
    });
}
function verifyAccessToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, accessSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired access token');
    }
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, refreshSecret);
    }
    catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
}
//# sourceMappingURL=jwt.js.map