// FAKE BACKEND
// Pretends to be the Laravel server so the app works before the real backend is ready.
// It follows the same rules as LockerService.php. Data resets when the app reloads.
// Every function here has the same name and result shape as real.js.

import { ApiError, fail } from './errors';
import { RULES } from '../config';

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const iso = (ms) => new Date(ms).toISOString();

let lastId = 1000;
const newId = () => ++lastId;

function randomToken() {
  const chars = '0123456789abcdef';
  let token = '';
  for (let i = 0; i < 64; i++) token += chars[Math.floor(Math.random() * 16)];
  return token;
}

// ---------------------------------------------------------------------------
// Starting data (sample students, lockers, past uses, reports)
// ---------------------------------------------------------------------------
const db = { users: [], lockers: [], reservations: [], qrCodes: [], reports: [], logs: [] };

function seed() {
  const now = Date.now();
  const day0 = new Date();
  day0.setHours(0, 0, 0, 0);

  db.users = [
    { id: 1, name: 'HelmLock Admin', student_id: null, email: 'admin@helmlock.test', password: 'password', role: 'admin', no_show_count: 0, blocked_until: null, created_at: iso(now - 40 * 24 * HOUR) },
    { id: 2, name: 'Juan Dela Cruz', student_id: '2023123456', email: 'student@helmlock.test', password: 'password', role: 'student', no_show_count: 1, blocked_until: null, created_at: iso(now - 20 * 24 * HOUR) },
    { id: 3, name: 'Ana Reyes', student_id: '2022104455', email: 'ana.reyes@gmail.com', password: 'password', role: 'student', no_show_count: 0, blocked_until: null, created_at: iso(now - 18 * 24 * HOUR) },
    { id: 4, name: 'Mark Santos', student_id: '2023117720', email: 'mark.santos@gmail.com', password: 'password', role: 'student', no_show_count: 2, blocked_until: null, created_at: iso(now - 15 * 24 * HOUR) },
    { id: 5, name: 'Liza Cruz', student_id: '2021098813', email: 'liza.cruz@gmail.com', password: 'password', role: 'student', no_show_count: 0, blocked_until: iso(now + 9 * HOUR), created_at: iso(now - 12 * 24 * HOUR) },
    { id: 6, name: 'Paolo Lim', student_id: '2024130021', email: 'paolo.lim@gmail.com', password: 'password', role: 'student', no_show_count: 0, blocked_until: null, created_at: iso(now - 6 * 24 * HOUR) },
  ];

  db.lockers = ['01', '02', '03', '04', '05', '06'].map((number, i) => ({
    id: i + 1,
    number,
    location: 'USTP CDO Campus',
    status: number === '06' ? 'out_of_service' : 'available',
    is_physical: number === '01',
  }));

  // Same "random" numbers every time, so the sample data looks the same
  let s = 7;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const students = [2, 3, 4, 5, 6];
  const hours = [7, 7, 8, 8, 8, 9, 10, 10, 13, 13, 14, 15];

  for (let d = 9; d >= 0; d--) {
    const dayStart = day0.getTime() - d * 24 * HOUR;
    const uses = d === 0 ? 3 : 2 + Math.floor(rand() * 3);
    for (let k = 0; k < uses; k++) {
      const userId = pick(students);
      const lockerId = 1 + Math.floor(rand() * 5);
      const start = dayStart + pick(hours) * HOUR + Math.floor(rand() * 4) * 15 * MIN;
      if (start + 4 * HOUR > now) continue; // only finished uses in the past
      const length = (2 + Math.floor(rand() * 4)) * HOUR;
      const roll = rand();
      const status = roll < 0.75 ? 'completed' : roll < 0.88 ? 'expired' : 'cancelled';
      const r = {
        id: newId(),
        user_id: userId,
        locker_id: lockerId,
        start_time: iso(start),
        end_time: iso(start + length),
        arrive_by: iso(start + RULES.arriveWindowMinutes * MIN),
        status,
        stored_at: status === 'completed' ? iso(start + 5 * MIN) : null,
        retrieved_at: status === 'completed' ? iso(start + length - 10 * MIN) : null,
        extensions: 0,
        created_at: iso(start - 20 * MIN),
      };
      if (status === 'completed' && rand() < 0.15) {
        r.extensions = 1;
        r.retrieved_at = iso(start + length + 25 * MIN);
      }
      db.reservations.push(r);
      addLog('reserved', r, 'Locker reserved', 0, r.created_at);
      if (status === 'completed') {
        addLog('stored', r, 'Helmet stored', RULES.fee, r.stored_at);
        if (r.extensions) addLog('extended', r, 'Storage time extended', RULES.extensionFee, iso(start + length + 20 * MIN));
        addLog('retrieved', r, 'Helmet retrieved', RULES.fee, r.retrieved_at);
      } else if (status === 'expired') {
        addLog('expired', r, 'No-show: helmet was not stored in time', 0, r.arrive_by);
      } else {
        addLog('cancelled', r, 'Cancelled by student', 0, iso(start - 5 * MIN));
      }
    }
  }

  // Ana's helmet is in Locker 03 right now
  const ana = { id: newId(), user_id: 3, locker_id: 3, start_time: iso(now - 70 * MIN), end_time: iso(now + 3 * HOUR), arrive_by: iso(now - 55 * MIN), status: 'stored', stored_at: iso(now - 62 * MIN), retrieved_at: null, extensions: 0, created_at: iso(now - 80 * MIN) };
  db.reservations.push(ana);
  db.lockers[2].status = 'occupied';
  addLog('reserved', ana, 'Locker reserved', 0, ana.created_at);
  addLog('stored', ana, 'Helmet stored', RULES.fee, ana.stored_at);

  db.reports = [
    { id: newId(), user_id: 4, locker_id: 2, message: 'Inserted a ₱5 coin but the locker did not respond. Had to insert another one.', status: 'open', created_at: iso(now - 5 * HOUR) },
    { id: newId(), user_id: 3, locker_id: 1, message: 'The LCD screen was very dim this morning, hard to read the message.', status: 'resolved', created_at: iso(now - 3 * 24 * HOUR) },
  ];

  db.logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

let currentUserId = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function me() {
  const user = db.users.find((u) => u.id === currentUserId);
  if (!user) throw new ApiError('Please log in again.', {}, 401);
  return user;
}

function admin() {
  const user = me();
  if (user.role !== 'admin') throw new ApiError('Admins only.', {}, 403);
  return user;
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

const isBlocked = (user) => !!user.blocked_until && new Date(user.blocked_until).getTime() > Date.now();
const userById = (id) => db.users.find((u) => u.id === id) || null;
const lockerById = (id) => db.lockers.find((l) => l.id === id) || null;
const lockerOf = (r) => lockerById(r.locker_id);
const qrOf = (r, type) => db.qrCodes.filter((q) => q.reservation_id === r.id && q.type === type).pop() || null;
const isLate = (r) => r.status === 'stored' && Date.now() > new Date(r.end_time).getTime();
const activeOf = (userId) => db.reservations.find((r) => r.user_id === userId && ['reserved', 'stored'].includes(r.status)) || null;
const activeInLocker = (lockerId) => db.reservations.find((r) => r.locker_id === lockerId && ['reserved', 'stored'].includes(r.status)) || null;

function addLog(action, reservation, details = null, amount = 0, when = null, extra = {}) {
  db.logs.unshift({
    id: newId(),
    action,
    reservation_id: reservation?.id ?? null,
    user_id: reservation?.user_id ?? null,
    locker_id: reservation?.locker_id ?? extra.locker_id ?? null,
    admin_id: extra.admin_id ?? null,
    details,
    amount,
    created_at: when || iso(Date.now()),
  });
}

function shapeReservation(r, withUser = false) {
  const locker = lockerOf(r);
  const out = {
    id: r.id,
    locker: locker ? { id: locker.id, number: locker.number, location: locker.location } : { id: null, number: '?', location: '' },
    start_time: r.start_time,
    end_time: r.end_time,
    arrive_by: r.arrive_by,
    status: r.status,
    stored_at: r.stored_at,
    retrieved_at: r.retrieved_at,
    extensions: r.extensions,
    is_late: isLate(r),
    created_at: r.created_at,
  };
  if (withUser) {
    const u = userById(r.user_id);
    out.user = u ? { id: u.id, name: u.name, student_id: u.student_id } : { id: null, name: 'Deleted account', student_id: '' };
  }
  return out;
}

function shapeQr(qr) {
  if (!qr) return null;
  const usable = !qr.used_at && (!qr.expires_at || new Date(qr.expires_at).getTime() > Date.now());
  return { type: qr.type, token: qr.token, used_at: qr.used_at, usable };
}

function expireQrs(r) {
  db.qrCodes.filter((q) => q.reservation_id === r.id && !q.used_at).forEach((q) => (q.expires_at = iso(Date.now())));
}

// Expire reservations whose helmet wasn't stored in time (no-shows)
function expireOverdue() {
  db.reservations
    .filter((r) => r.status === 'reserved' && new Date(r.arrive_by).getTime() < Date.now())
    .forEach((r) => {
      r.status = 'expired';
      expireQrs(r);
      const locker = lockerOf(r);
      if (locker && locker.status === 'reserved') locker.status = 'available';
      addLog('expired', r, 'No-show: helmet was not stored in time');

      const user = userById(r.user_id);
      if (user) {
        user.no_show_count += 1;
        if (user.no_show_count >= RULES.noShowLimit) {
          user.no_show_count = 0;
          user.blocked_until = iso(Date.now() + RULES.blockHours * HOUR);
        }
      }
    });
}

function todayAt(time) {
  const [h, m] = String(time).split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

const findLogin = (value) => {
  const v = (value || '').trim().toLowerCase();
  return db.users.find((u) => u.email === v || (u.student_id && u.student_id.toLowerCase() === v)) || null;
};

const validEmail = (mail) => /^\S+@\S+\.\S+$/.test(mail);

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------
export function setToken(token) {
  currentUserId = token && token.startsWith('fake-token-') ? Number(token.replace('fake-token-', '')) : null;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function login({ login, password }) {
  await wait();
  if (!login?.trim()) fail('login', 'Please enter your email or student ID.');
  if (!password) fail('password', 'Please enter your password.');
  const user = findLogin(login);
  if (!user || user.password !== password) fail('login', 'Incorrect email/student ID or password.');
  currentUserId = user.id;
  return { token: 'fake-token-' + user.id, user: publicUser(user) };
}

export async function register({ name, student_id, email, password, password_confirmation, terms }) {
  await wait();
  const errors = {};
  const studentId = (student_id || '').trim();
  const mail = (email || '').trim().toLowerCase();

  if (!name?.trim()) errors.name = ['Please enter your full name.'];
  if (!studentId) errors.student_id = ['Please enter your student ID.'];
  else if (!/^[A-Za-z0-9_-]+$/.test(studentId)) errors.student_id = ['Student ID can only have letters, numbers, dashes, and underscores.'];
  else if (db.users.some((u) => u.student_id === studentId)) errors.student_id = ['This student ID already has an account.'];
  if (!validEmail(mail)) errors.email = ['Please enter a valid email.'];
  else if (db.users.some((u) => u.email === mail)) errors.email = ['This email is already registered.'];
  if (!password || password.length < 8) errors.password = ['Password must be at least 8 characters.'];
  else if (password !== password_confirmation) errors.password_confirmation = ["Passwords don't match."];
  if (!terms) errors.terms = ['Please agree to the Terms and Rules to continue.'];
  if (Object.keys(errors).length) throw new ApiError('Please check the form.', errors);

  const user = { id: newId(), name: name.trim(), student_id: studentId, email: mail, password, role: 'student', no_show_count: 0, blocked_until: null, created_at: iso(Date.now()) };
  db.users.push(user);
  currentUserId = user.id;
  return { token: 'fake-token-' + user.id, user: publicUser(user) };
}

export async function logout() {
  await wait(150);
  currentUserId = null;
  return { ok: true };
}

export async function getMe() {
  await wait(150);
  return { user: publicUser(me()) };
}

// Step 1: email a 6-digit code (in the fake backend the code is always 123456)
export async function forgotPassword({ login }) {
  await wait();
  if (!login?.trim()) fail('login', 'Please enter your email or student ID.');
  return { message: 'If that account exists, we sent a 6-digit code to its email.' };
}

// Step 2: set a new password with the code
export async function resetPassword({ login, code, password, password_confirmation }) {
  await wait();
  const user = findLogin(login);
  if (code !== '123456' || !user) fail('code', 'That code is wrong or has expired.');
  if (!password || password.length < 8) fail('password', 'Password must be at least 8 characters.');
  if (password !== password_confirmation) fail('password_confirmation', "Passwords don't match.");
  user.password = password;
  return { message: 'Your password was reset. You can log in now.' };
}

// ---------------------------------------------------------------------------
// Profile (students and admins)
// ---------------------------------------------------------------------------
export async function updateProfile({ name, email }) {
  await wait();
  const user = me();
  const mail = (email || '').trim().toLowerCase();
  if (!name?.trim()) fail('name', 'Please enter your full name.');
  if (!validEmail(mail)) fail('email', 'Please enter a valid email.');
  if (db.users.some((u) => u.email === mail && u.id !== user.id)) fail('email', 'This email is already used by another account.');
  user.name = name.trim();
  user.email = mail;
  return { message: 'Your details were saved.', user: publicUser(user) };
}

export async function updatePassword({ current_password, password, password_confirmation }) {
  await wait();
  const user = me();
  if (user.password !== current_password) fail('current_password', 'Your current password is incorrect.');
  if (!password || password.length < 8) fail('password', 'Password must be at least 8 characters.');
  if (password !== password_confirmation) fail('password_confirmation', "Passwords don't match.");
  user.password = password;
  return { message: 'Your password was changed.' };
}

// ---------------------------------------------------------------------------
// Student: home and lockers
// ---------------------------------------------------------------------------
export async function getHome() {
  await wait();
  expireOverdue();
  const user = me();
  const active = activeOf(user.id);
  return {
    user: publicUser(user),
    active_reservation: active ? shapeReservation(active) : null,
    available_count: db.lockers.filter((l) => l.status === 'available').length,
  };
}

export async function getLockers() {
  await wait();
  expireOverdue();
  return {
    lockers: db.lockers.filter((l) => l.status !== 'out_of_service').map(({ id, number, location, status }) => ({ id, number, location, status })),
  };
}

// ---------------------------------------------------------------------------
// Student: reservations
// ---------------------------------------------------------------------------
export async function createReservation({ locker_id, start_time, end_time }) {
  await wait();
  expireOverdue();
  const user = me();

  if (!locker_id) fail('locker_id', 'Please choose a locker.');
  if (isBlocked(user)) fail('locker_id', 'You are temporarily blocked from reserving because of missed reservations.');
  if (activeOf(user.id)) fail('locker_id', 'You already have an active reservation.');

  const start = todayAt(start_time);
  const end = todayAt(end_time);
  if (start < Date.now() - 5 * MIN) fail('start_time', 'That drop-off time has already passed.');
  if (start > Date.now() + RULES.maxAdvanceMinutes * MIN) fail('start_time', `You can only reserve up to ${RULES.maxAdvanceMinutes} minutes ahead.`);
  if (end < start + 15 * MIN) fail('end_time', 'Retrieval time must be at least 15 minutes after drop-off.');
  if (end > start + RULES.maxStorageHours * HOUR) fail('end_time', `You can store your helmet for up to ${RULES.maxStorageHours} hours.`);

  const locker = lockerById(locker_id);
  if (!locker || locker.status !== 'available') fail('locker_id', 'That locker was just taken. Please choose another one.');

  const r = {
    id: newId(),
    user_id: user.id,
    locker_id: locker.id,
    start_time: iso(start),
    end_time: iso(end),
    arrive_by: iso(start + RULES.arriveWindowMinutes * MIN),
    status: 'reserved',
    stored_at: null,
    retrieved_at: null,
    extensions: 0,
    created_at: iso(Date.now()),
  };
  db.reservations.push(r);
  locker.status = 'reserved';
  db.qrCodes.push({ id: newId(), reservation_id: r.id, type: 'in', token: randomToken(), used_at: null, expires_at: null });
  db.qrCodes.push({ id: newId(), reservation_id: r.id, type: 'out', token: randomToken(), used_at: null, expires_at: null });
  addLog('reserved', r, 'Locker reserved');

  return { message: `Locker ${locker.number} is reserved for you.`, reservation: shapeReservation(r) };
}

export async function getReservation(id) {
  await wait();
  expireOverdue();
  const user = me();
  const r = db.reservations.find((x) => x.id === Number(id) && x.user_id === user.id);
  if (!r) throw new ApiError('Reservation not found.', {}, 404);
  return { reservation: shapeReservation(r) };
}

export async function cancelReservation(id) {
  await wait();
  const user = me();
  const r = db.reservations.find((x) => x.id === Number(id) && x.user_id === user.id);
  if (!r) throw new ApiError('Reservation not found.', {}, 404);
  if (r.status !== 'reserved') throw new ApiError('Only reservations that have not been used yet can be cancelled.');
  r.status = 'cancelled';
  expireQrs(r);
  const locker = lockerOf(r);
  if (locker && locker.status === 'reserved') locker.status = 'available';
  addLog('cancelled', r, 'Cancelled by student');
  return { message: 'Your reservation was cancelled.' };
}

export async function getHistory() {
  await wait();
  expireOverdue();
  const user = me();
  return {
    reservations: db.reservations
      .filter((r) => r.user_id === user.id)
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
      .map((r) => shapeReservation(r)),
  };
}

// ---------------------------------------------------------------------------
// Student: QR codes
// ---------------------------------------------------------------------------
export async function getMyQr() {
  await wait();
  expireOverdue();
  const user = me();
  const active = activeOf(user.id);
  if (!active) return { reservation: null, in: null, out: null };
  return { reservation: shapeReservation(active), in: shapeQr(qrOf(active, 'in')), out: shapeQr(qrOf(active, 'out')) };
}

export async function regenerateOutQr() {
  await wait();
  const user = me();
  const active = activeOf(user.id);
  if (!active || active.status !== 'stored') throw new ApiError('You can only make a new OUT QR after your helmet is stored.');
  db.qrCodes.filter((q) => q.reservation_id === active.id && q.type === 'out' && !q.used_at).forEach((q) => (q.expires_at = iso(Date.now())));
  db.qrCodes.push({ id: newId(), reservation_id: active.id, type: 'out', token: randomToken(), used_at: null, expires_at: null });
  addLog('qr_regenerated', active, 'New OUT QR created');
  return { message: 'New OUT QR created. Your old one no longer works.', out: shapeQr(qrOf(active, 'out')) };
}

// TESTING ONLY: pretend the locker scanned your QR (like the website's "Simulate scan" buttons)
export async function simulateScan(type) {
  await wait(500);
  expireOverdue();
  const user = me();
  const active = activeOf(user.id);
  if (!active) return { ok: false, action: null, message: 'You have no active reservation.', lcd: ['No reservation', 'Reserve first'] };

  const qr = qrOf(active, type);
  const locker = lockerOf(active);

  if (type === 'in') {
    if (active.status !== 'reserved' || !shapeQr(qr)?.usable) return { ok: false, action: null, message: 'QR already used or expired', lcd: ['QR used/expired', 'Check app'] };
    qr.used_at = iso(Date.now());
    active.status = 'stored';
    active.stored_at = iso(Date.now());
    locker.status = 'occupied';
    addLog('stored', active, 'Helmet stored', RULES.fee);
    return { ok: true, action: 'store', message: 'Door open. Store your helmet.', lcd: ['Door open', 'Store helmet'], locker: locker.number };
  }

  if (active.status !== 'stored') return { ok: false, action: null, message: 'Store your helmet first', lcd: ['Store first', 'Use IN QR'] };
  if (isLate(active)) return { ok: false, action: null, code: 'extension_required', message: 'Time expired. Insert the extension fee to continue.', lcd: ['Time expired', `Insert P${RULES.extensionFee} coin`], locker: locker.number };

  qr.used_at = iso(Date.now());
  active.status = 'completed';
  active.retrieved_at = iso(Date.now());
  locker.status = 'available';
  addLog('retrieved', active, 'Helmet retrieved', RULES.fee);
  return { ok: true, action: 'retrieve', message: 'Door open. Take your helmet.', lcd: ['Door open', 'Take helmet'], locker: locker.number };
}

export async function simulateExtend() {
  await wait(500);
  const user = me();
  const active = activeOf(user.id);
  if (!active || !isLate(active)) return { ok: false, action: null, message: 'No extension needed', lcd: ['No extension', 'Scan OUT QR'] };
  active.end_time = iso(Date.now() + RULES.extensionMinutes * MIN);
  active.extensions += 1;
  addLog('extended', active, 'Storage time extended', RULES.extensionFee);
  return { ok: true, action: 'extend', message: 'Time extended. Scan your OUT QR again.', lcd: ['Time extended', 'Scan OUT QR'], locker: lockerOf(active).number };
}

// TESTING ONLY: jump to "late" so you can try the extension screens without waiting
export async function simulateLate() {
  await wait(300);
  const user = me();
  const active = activeOf(user.id);
  if (!active || active.status !== 'stored') return { ok: false, message: 'Store your helmet first.' };
  active.end_time = iso(Date.now() - MIN);
  return { ok: true, message: 'Your retrieval time is now over (testing only).' };
}

// ---------------------------------------------------------------------------
// Student: problem reports
// ---------------------------------------------------------------------------
export async function getReportLockers() {
  await wait(150);
  return { lockers: db.lockers.map(({ id, number }) => ({ id, number })) };
}

export async function createReport({ locker_id, message }) {
  await wait();
  const user = me();
  if (!message || message.trim().length < 10) fail('message', 'Please describe the problem in at least 10 characters.');
  db.reports.unshift({ id: newId(), user_id: user.id, locker_id: locker_id || null, message: message.trim(), status: 'open', created_at: iso(Date.now()) });
  return { message: "Thanks! Your report was sent. We'll check it soon." };
}

// ---------------------------------------------------------------------------
// Admin: overview
// ---------------------------------------------------------------------------
function shapeLog(log) {
  const u = userById(log.user_id);
  const a = userById(log.admin_id);
  const l = lockerById(log.locker_id);
  return { id: log.id, action: log.action, details: log.details, amount: log.amount, created_at: log.created_at, user: u ? u.name : null, admin: a ? a.name : null, locker: l ? l.number : null };
}

function lockerWithCurrent(l) {
  const current = activeInLocker(l.id);
  return {
    ...l,
    current: current ? shapeReservation(current, true) : null,
    history_count: db.reservations.filter((r) => r.locker_id === l.id).length,
  };
}

export async function adminDashboard() {
  await wait();
  expireOverdue();
  admin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = db.logs.filter((g) => new Date(g.created_at) >= today);
  const count = (status) => db.lockers.filter((l) => l.status === status).length;

  const byHour = {};
  db.logs.filter((g) => g.action === 'stored').forEach((g) => {
    const h = new Date(g.created_at).getHours();
    byHour[h] = (byHour[h] || 0) + 1;
  });
  const busiest = Object.entries(byHour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, uses]) => ({ hour: Number(hour), uses }));

  return {
    lockers: { available: count('available'), reserved: count('reserved'), occupied: count('occupied'), out_of_service: count('out_of_service') },
    active_reservations: db.reservations.filter((r) => ['reserved', 'stored'].includes(r.status)).length,
    students: db.users.filter((u) => u.role === 'student').length,
    uses_today: todayLogs.filter((g) => g.action === 'stored').length,
    money_today: todayLogs.reduce((sum, g) => sum + g.amount, 0),
    money_total: db.logs.reduce((sum, g) => sum + g.amount, 0),
    total_uses: db.logs.filter((g) => g.action === 'stored').length,
    open_reports: db.reports.filter((r) => r.status === 'open').length,
    busiest_hours: busiest,
    late: db.reservations.filter(isLate).length,
    recent: db.logs.slice(0, 12).map(shapeLog),
  };
}

// ---------------------------------------------------------------------------
// Admin: lockers
// ---------------------------------------------------------------------------
export async function adminLockers() {
  await wait();
  expireOverdue();
  admin();
  return { lockers: [...db.lockers].sort((a, b) => a.number.localeCompare(b.number)).map(lockerWithCurrent) };
}

export async function adminAddLocker({ number, location }) {
  await wait();
  const a = admin();
  const n = (number || '').trim();
  if (!n) fail('number', 'Please enter a locker number.');
  if (n.length > 10) fail('number', 'Locker number can be up to 10 characters.');
  if (db.lockers.some((l) => l.number === n)) fail('number', 'That locker number already exists.');
  const locker = { id: newId(), number: n, location: (location || '').trim() || 'USTP CDO Campus', status: 'available', is_physical: false };
  db.lockers.push(locker);
  addLog('locker_added', null, `Locker ${n} added`, 0, null, { locker_id: locker.id, admin_id: a.id });
  return { message: `Locker ${n} added.`, locker: lockerWithCurrent(locker) };
}

export async function adminUpdateLocker(id, { number, location }) {
  await wait();
  const a = admin();
  const locker = lockerById(Number(id));
  if (!locker) throw new ApiError('Locker not found.', {}, 404);
  const n = (number || '').trim();
  if (!n) fail('number', 'Please enter a locker number.');
  if (db.lockers.some((l) => l.number === n && l.id !== locker.id)) fail('number', 'That locker number already exists.');
  const renamed = n !== locker.number;
  if (renamed && ['reserved', 'occupied'].includes(locker.status)) fail('number', `Locker ${locker.number} is in use. Change its number after it is free.`);
  const old = locker.number;
  locker.number = n;
  locker.location = (location || '').trim() || 'USTP CDO Campus';
  addLog('locker_edited', null, renamed ? `Locker ${old} renamed to ${n}` : `Locker ${n} details updated`, 0, null, { locker_id: locker.id, admin_id: a.id });
  let message = `Locker ${n} saved.`;
  if (renamed && locker.is_physical) message += ' This is the real locker, so change the locker number in the ESP32 code too.';
  return { message, locker: lockerWithCurrent(locker) };
}

export async function adminDeleteLocker(id) {
  await wait();
  const a = admin();
  const locker = lockerById(Number(id));
  if (!locker) throw new ApiError('Locker not found.', {}, 404);
  if (locker.is_physical) throw new ApiError(`Locker ${locker.number} is the real ESP32 locker, so it can't be deleted.`);
  if (['reserved', 'occupied'].includes(locker.status)) throw new ApiError(`Locker ${locker.number} is in use. Release it first.`);
  if (db.reservations.some((r) => r.locker_id === locker.id)) throw new ApiError(`Locker ${locker.number} has reservation history, so deleting it would erase records used in reports. Set it Out of Service instead.`);
  db.lockers = db.lockers.filter((l) => l.id !== locker.id);
  addLog('locker_deleted', null, `Locker ${locker.number} deleted`, 0, null, { admin_id: a.id });
  return { message: `Locker ${locker.number} deleted.` };
}

export async function adminSetLockerStatus(id, status) {
  await wait();
  const a = admin();
  const locker = lockerById(Number(id));
  if (!locker) throw new ApiError('Locker not found.', {}, 404);
  if (status === 'out_of_service' && locker.status !== 'available') throw new ApiError(`Locker ${locker.number} is in use. Release it first.`);
  if (status === 'available' && locker.status !== 'out_of_service') throw new ApiError(`Locker ${locker.number} is not out of service.`);
  locker.status = status;
  const label = status === 'available' ? 'Available' : 'Out of Service';
  addLog('status_changed', null, `Locker ${locker.number} set to ${label}`, 0, null, { locker_id: locker.id, admin_id: a.id });
  return { message: `Locker ${locker.number} is now ${label}.` };
}

// After opening a locker with the manual key: end its reservation and free it
export async function adminReleaseLocker(id) {
  await wait();
  const a = admin();
  const locker = lockerById(Number(id));
  if (!locker) throw new ApiError('Locker not found.', {}, 404);
  const r = activeInLocker(locker.id);
  if (r) {
    if (r.status === 'stored') {
      r.status = 'completed';
      r.retrieved_at = iso(Date.now());
    } else {
      r.status = 'cancelled';
    }
    expireQrs(r);
    addLog('released', r, 'Released by admin (manual key)', 0, null, { admin_id: a.id });
  }
  locker.status = 'available';
  return { message: `Locker ${locker.number} released and available again.` };
}

// ---------------------------------------------------------------------------
// Admin: reservations and students
// ---------------------------------------------------------------------------
export async function adminReservations({ status = '', q = '' } = {}) {
  await wait();
  expireOverdue();
  admin();
  const search = q.trim().toLowerCase();
  const list = db.reservations
    .filter((r) => !status || r.status === status)
    .filter((r) => {
      if (!search) return true;
      const u = userById(r.user_id);
      const l = lockerOf(r);
      return (u && (u.name.toLowerCase().includes(search) || (u.student_id || '').includes(search))) || (l && l.number.includes(search));
    })
    .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
    .slice(0, 100)
    .map((r) => shapeReservation(r, true));
  return { reservations: list };
}

export async function adminStudents({ q = '' } = {}) {
  await wait();
  admin();
  const search = q.trim().toLowerCase();
  return {
    students: db.users
      .filter((u) => u.role === 'student')
      .filter((u) => !search || u.name.toLowerCase().includes(search) || (u.student_id || '').includes(search) || u.email.includes(search))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((u) => ({
        ...publicUser(u),
        is_blocked: isBlocked(u),
        total_reservations: db.reservations.filter((r) => r.user_id === u.id).length,
        completed: db.reservations.filter((r) => r.user_id === u.id && r.status === 'completed').length,
        no_shows: db.reservations.filter((r) => r.user_id === u.id && r.status === 'expired').length,
      })),
  };
}

export async function adminUnblockStudent(id) {
  await wait();
  const a = admin();
  const u = userById(Number(id));
  if (!u) throw new ApiError('Student not found.', {}, 404);
  u.blocked_until = null;
  u.no_show_count = 0;
  addLog('unblocked', null, `${u.name} unblocked`, 0, null, { admin_id: a.id });
  return { message: `${u.name} can reserve again.` };
}

// ---------------------------------------------------------------------------
// Admin: problem reports
// ---------------------------------------------------------------------------
export async function adminReports() {
  await wait();
  admin();
  return {
    reports: db.reports
      .slice()
      .sort((a, b) => (a.status === b.status ? new Date(b.created_at) - new Date(a.created_at) : a.status === 'open' ? -1 : 1))
      .map((r) => {
        const u = userById(r.user_id);
        const l = lockerById(r.locker_id);
        return { ...r, user: u ? { name: u.name, student_id: u.student_id } : null, locker: l ? l.number : null };
      }),
  };
}

export async function adminToggleReport(id) {
  await wait();
  admin();
  const r = db.reports.find((x) => x.id === Number(id));
  if (!r) throw new ApiError('Report not found.', {}, 404);
  r.status = r.status === 'open' ? 'resolved' : 'open';
  return { message: r.status === 'resolved' ? 'Marked as resolved.' : 'Opened again.' };
}

// ---------------------------------------------------------------------------
// Admin: team (admin accounts)
// ---------------------------------------------------------------------------
export async function adminTeam() {
  await wait();
  const a = admin();
  return { admins: db.users.filter((u) => u.role === 'admin').map((u) => ({ ...publicUser(u), is_me: u.id === a.id })) };
}

export async function adminAddAdmin({ name, email, password, password_confirmation }) {
  await wait();
  admin();
  const errors = {};
  const mail = (email || '').trim().toLowerCase();
  if (!name?.trim()) errors.name = ['Please enter the full name.'];
  if (!validEmail(mail)) errors.email = ['Please enter a valid email.'];
  else if (db.users.some((u) => u.email === mail)) errors.email = ['This email is already used by another account.'];
  if (!password || password.length < 8) errors.password = ['Password must be at least 8 characters.'];
  else if (password !== password_confirmation) errors.password_confirmation = ["Passwords don't match."];
  if (Object.keys(errors).length) throw new ApiError('Please check the form.', errors);
  const user = { id: newId(), name: name.trim(), student_id: null, email: mail, password, role: 'admin', no_show_count: 0, blocked_until: null, created_at: iso(Date.now()) };
  db.users.push(user);
  return { message: `${user.name} was added as an admin.` };
}

export async function adminRemoveAdmin(id) {
  await wait();
  const a = admin();
  const u = userById(Number(id));
  if (!u || u.role !== 'admin') throw new ApiError('Admin not found.', {}, 404);
  if (u.id === a.id) throw new ApiError("You can't remove your own account.");
  if (db.users.filter((x) => x.role === 'admin').length <= 1) throw new ApiError('There must be at least one admin.');
  db.users = db.users.filter((x) => x.id !== u.id);
  return { message: `${u.name} was removed from the team.` };
}

// ---------------------------------------------------------------------------
// Admin: export as CSV (opens in Excel / Google Sheets)
// ---------------------------------------------------------------------------
const cell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop Excel formulas
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const toCsv = (headers, rows) => [headers, ...rows].map((row) => row.map(cell).join(',')).join('\n');
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hm = (v) => {
  if (!v) return '';
  const d = new Date(v);
  let h = d.getHours();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${ap}`;
};

export async function adminExport({ type, from, to }) {
  await wait(500);
  admin();
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T23:59:59');
  if (isNaN(start) || isNaN(end)) fail('from', 'Please pick valid dates.');
  if (end < start) fail('to', 'The end date must be on or after the start date.');
  const inRange = (v) => {
    const d = new Date(v);
    return d >= start && d <= end;
  };
  const logs = db.logs.filter((g) => inRange(g.created_at)).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let headers;
  let rows;

  if (type === 'daily') {
    headers = ['Date', 'Reservations made', 'Helmets stored', 'Helmets retrieved', 'Extensions', 'No-shows', 'Cancelled', 'Money collected (PHP)'];
    rows = [];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = ymd(d);
      const dayLogs = logs.filter((g) => ymd(new Date(g.created_at)) === key);
      const c = (a) => dayLogs.filter((g) => g.action === a).length;
      const values = [c('reserved'), c('stored'), c('retrieved'), c('extended'), c('expired'), c('cancelled'), dayLogs.reduce((s, g) => s + g.amount, 0)];
      values.forEach((v, i) => (totals[i] += v));
      rows.push([key, ...values]);
    }
    rows.push(['TOTAL', ...totals]);
  } else if (type === 'hours') {
    headers = ['Hour', 'Helmets stored', 'Helmets retrieved', 'Total uses', 'Money collected (PHP)'];
    rows = Array.from({ length: 24 }, (_, h) => {
      const hl = logs.filter((g) => new Date(g.created_at).getHours() === h && ['stored', 'retrieved', 'extended'].includes(g.action));
      const st = hl.filter((g) => g.action === 'stored').length;
      const rt = hl.filter((g) => g.action === 'retrieved').length;
      const label = `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'} - ${h % 12 || 12}:59 ${h >= 12 ? 'PM' : 'AM'}`;
      return [label, st, rt, st + rt, hl.reduce((s, g) => s + g.amount, 0)];
    });
  } else if (type === 'activity') {
    headers = ['Date', 'Time', 'Action', 'Locker', 'Student', 'Done by admin', 'Details', 'Amount (PHP)'];
    rows = logs.map((g) => {
      const x = shapeLog(g);
      return [ymd(new Date(g.created_at)), hm(g.created_at), x.action.replace(/_/g, ' '), x.locker || '', x.user || '', x.admin || '', x.details || '', g.amount];
    });
  } else if (type === 'reservations') {
    headers = ['Reservation ID', 'Student', 'Student ID', 'Locker', 'Date', 'Drop-off', 'Retrieve by', 'Stored at', 'Retrieved at', 'Extensions', 'Status'];
    rows = db.reservations
      .filter((r) => inRange(r.start_time))
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .map((r) => {
        const u = userById(r.user_id);
        return [r.id, u?.name || 'Deleted account', u?.student_id || '', lockerOf(r)?.number || '', ymd(new Date(r.start_time)), hm(r.start_time), hm(r.end_time), hm(r.stored_at), hm(r.retrieved_at), r.extensions, r.status];
      });
  } else if (type === 'students') {
    headers = ['Name', 'Student ID', 'Email', 'Registered', 'Total reservations', 'Completed', 'No-shows', 'Current strikes', 'Blocked until'];
    rows = db.users
      .filter((u) => u.role === 'student')
      .map((u) => [u.name, u.student_id, u.email, ymd(new Date(u.created_at)), db.reservations.filter((r) => r.user_id === u.id).length, db.reservations.filter((r) => r.user_id === u.id && r.status === 'completed').length, db.reservations.filter((r) => r.user_id === u.id && r.status === 'expired').length, u.no_show_count, isBlocked(u) ? `${ymd(new Date(u.blocked_until))} ${hm(u.blocked_until)}` : '']);
  } else {
    fail('type', 'Please choose a file to export.');
  }

  const filename = type === 'students' ? `helmlock-students-${ymd(new Date())}.csv` : `helmlock-${type}-${from}-to-${to}.csv`;
  return { filename, rows: rows.length, csv: toCsv(headers, rows) };
}

seed();
