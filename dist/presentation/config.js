"use strict";
/**
 * Presentation Mode Configuration
 * Global feature flag for demo/presentation purposes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationMode = void 0;
exports.getPresentationMode = getPresentationMode;
exports.setPresentationMode = setPresentationMode;
const env_1 = require("../config/env");
exports.PresentationMode = {
    enabled: false,
    forcedLocationRisk: 1.0,
    forcedTimeRisk: 1.0,
    audioMultiplier: 1.5,
    motionMultiplier: 1.5,
    autoSOSLowerThreshold: 35,
};
// Password-protected toggle (stored in memory for v1)
let presentationModeEnabled = false;
function getPresentationMode() {
    return presentationModeEnabled || exports.PresentationMode.enabled;
}
function setPresentationMode(enabled, password) {
    const correctPassword = env_1.env.presentationModePassword();
    if (password === correctPassword) {
        presentationModeEnabled = enabled;
        return true;
    }
    return false;
}
//# sourceMappingURL=config.js.map