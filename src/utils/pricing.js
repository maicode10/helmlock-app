// HelmLock pricing (same rules as the Laravel backend and the ESP32)
//   Drop-off (IN):  ₱5, always
//   Retrieval (OUT): ₱5 for every hour reserved
//   Late:           +₱5 for every hour past the retrieval time (the first 15 minutes late are free)
//                   never more than ₱50, and a helmet left overnight (after closing) pays a flat ₱50
import { RULES } from '../config';

import { LATE } from './lateRules';

export { LATE };

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const ms = (t) => (t instanceof Date ? t.getTime() : new Date(t).getTime());

// Whole hours reserved, rounded up (1 hr 10 min counts as 2 hours)
export function reservedHours(start, end) {
  return Math.max(1, Math.ceil((ms(end) - ms(start)) / HOUR - 1e-9));
}

// Hours charged as late. Nothing within the grace period, then every started hour counts.
export function lateHours(end, at = Date.now()) {
  const late = (ms(at) - ms(end)) / MIN;
  if (late <= LATE.graceMinutes) return 0;
  return Math.ceil(late / 60 - 1e-9);
}

// True when the helmet is still inside after closing time (9:00 PM) on its retrieval day
export function isOvernight(end, at = Date.now()) {
  const close = new Date(ms(end));
  close.setHours(RULES.closeHour, 0, 0, 0);
  if (close.getTime() < ms(end)) close.setDate(close.getDate() + 1);
  return ms(at) > close.getTime();
}

// Late fee in pesos: ₱5 per late hour, max ₱50. Overnight = flat ₱50.
export function lateFeeFor(end, at = Date.now()) {
  const hours = lateHours(end, at);
  if (hours === 0) return 0;
  if (isOvernight(end, at)) return LATE.max;
  return Math.min(hours * LATE.perHour, LATE.max);
}

// Price before reserving
export function quote(hours) {
  const retrieval = hours * RULES.hourlyFee;
  return { dropOff: RULES.dropOffFee, retrieval, total: RULES.dropOffFee + retrieval };
}

// What a reservation costs now (or at `at`). Use the backend's numbers when it sends them.
export function feesFor(r, at = Date.now()) {
  if (r.fees) return r.fees;
  const hours = reservedHours(r.start_time, r.end_time);
  const until = r.retrieved_at ? r.retrieved_at : at;
  const late = r.status === 'stored' || r.status === 'completed' ? lateHours(r.end_time, until) : 0;
  const retrieval = hours * RULES.hourlyFee;
  const lateFee = late ? lateFeeFor(r.end_time, until) : 0;
  return {
    hours,
    late_hours: late,
    overnight: late > 0 && isOvernight(r.end_time, until),
    drop_off: RULES.dropOffFee,
    retrieval,
    late_fee: lateFee,
    due_at_retrieval: retrieval + lateFee,
    total: RULES.dropOffFee + retrieval + lateFee,
  };
}

// Minutes left in the free grace period (0 when not late or already past it)
export function graceLeft(end, at = Date.now()) {
  const late = (ms(at) - ms(end)) / MIN;
  if (late <= 0 || late > LATE.graceMinutes) return 0;
  return Math.ceil(LATE.graceMinutes - late);
}

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-US');
