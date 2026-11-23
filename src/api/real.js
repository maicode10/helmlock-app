// REAL BACKEND
// Talks to the Laravel API. Every function has the same name and result shape as fake.js,
// so the screens don't change. The full list of endpoints is in API_CONTRACT.md.

import { ApiError } from './errors';
import { API_URL } from '../config';

let token = null;

export function setToken(value) {
  token = value;
}

// One request to the backend, with the login token and a 15-second time limit
async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  let res;
  try {
    res = await fetch(API_URL + '/api' + path, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    throw new ApiError("Can't reach the HelmLock server. Check your internet and try again.", {}, 0);
  } finally {
    clearTimeout(timer);
  }

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // empty or non-JSON response
  }

  if (!res.ok) {
    if (res.status === 401) throw new ApiError('Please log in again.', {}, 401);
    if (res.status === 429) throw new ApiError('Too many tries. Please wait a minute and try again.', {}, 429);
    throw new ApiError(data.message || 'Something went wrong. Please try again.', data.errors || {}, res.status);
  }
  return data;
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body || {});
const put = (path, body) => request('PUT', path, body || {});
const del = (path) => request('DELETE', path);
const query = (params) => {
  const s = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return s ? '?' + s : '';
};

// ---------- Auth ----------
export const login = (form) => post('/login', form);
export const register = (form) => post('/register', form);
export const logout = () => post('/logout');
export const getMe = () => get('/me');
export const forgotPassword = (form) => post('/forgot-password', form);
export const resetPassword = (form) => post('/reset-password', form);

// ---------- Profile ----------
export const updateProfile = (form) => put('/profile', form);
export const updatePassword = (form) => put('/profile/password', form);

// ---------- Student ----------
export const getHome = () => get('/home');
export const getLockers = () => get('/lockers');
export const createReservation = (form) => post('/reservations', form);
export const getReservation = (id) => get(`/reservations/${id}`);
export const cancelReservation = (id) => post(`/reservations/${id}/cancel`);
export const getHistory = () => get('/reservations');
export const getMyQr = () => get('/qr');
export const regenerateOutQr = () => post('/qr/out/regenerate');
export const getReportLockers = () => get('/reports/lockers');
export const createReport = (form) => post('/reports', form);

// ---------- Admin ----------
export const adminDashboard = () => get('/admin/dashboard');
export const adminLockers = () => get('/admin/lockers');
export const adminAddLocker = (form) => post('/admin/lockers', form);
export const adminUpdateLocker = (id, form) => put(`/admin/lockers/${id}`, form);
export const adminDeleteLocker = (id) => del(`/admin/lockers/${id}`);
export const adminSetLockerStatus = (id, status) => post(`/admin/lockers/${id}/status`, { status });
export const adminReleaseLocker = (id) => post(`/admin/lockers/${id}/release`);
export const adminReservations = (params = {}) => get('/admin/reservations' + query(params));
export const adminStudents = (params = {}) => get('/admin/students' + query(params));
export const adminUnblockStudent = (id) => post(`/admin/students/${id}/unblock`);
export const adminReports = () => get('/admin/reports');
export const adminToggleReport = (id) => post(`/admin/reports/${id}/toggle`);
export const adminTeam = () => get('/admin/team');
export const adminAddAdmin = (form) => post('/admin/team', form);
export const adminRemoveAdmin = (id) => del(`/admin/team/${id}`);
export const adminExport = (params) => get('/admin/export' + query(params));
export const adminBlockStudent = (id, hours = null) => post(`/admin/students/${id}/block`, { hours });