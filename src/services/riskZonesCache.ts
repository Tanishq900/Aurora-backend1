import { supabaseAdmin } from '../db/supabaseAdmin';

type RiskZoneRow = any;

let cache: { value: RiskZoneRow[]; expiresAt: number } | null = null;
let inflight: Promise<RiskZoneRow[]> | null = null;

export async function getRiskZonesCached(ttlMs = 60_000): Promise<RiskZoneRow[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;
  if (inflight) return inflight;

  inflight = (async () => {
    const { data, error } = await supabaseAdmin.from('risk_zones').select('*');
    if (error) throw new Error(error.message);
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
