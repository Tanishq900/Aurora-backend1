"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRiskZonesCached = getRiskZonesCached;
const supabaseAdmin_1 = require("../db/supabaseAdmin");
let cache = null;
let inflight = null;
async function getRiskZonesCached(ttlMs = 60000) {
    const now = Date.now();
    if (cache && cache.expiresAt > now)
        return cache.value;
    if (inflight)
        return inflight;
    inflight = (async () => {
        const { data, error } = await supabaseAdmin_1.supabaseAdmin.from('risk_zones').select('*');
        if (error)
            throw new Error(error.message);
        const value = Array.isArray(data) ? data : [];
        cache = { value, expiresAt: now + ttlMs };
        inflight = null;
        return value;
    })().catch((e) => {
        inflight = null;
        throw e;
    });
    return inflight;
}
//# sourceMappingURL=riskZonesCache.js.map