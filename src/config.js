// HelmLock app settings.

// true  = use the fake backend inside the app (no server needed)
// false = use the real HelmLock server at API_URL
export const USE_FAKE_API = false;

// The HelmLock server (Node.js + Express, hosted on Render). Use https://
// Running it on your own laptop instead: http://YOUR-LAPTOP-IP:3000 (installed APKs block plain http)
export const API_URL = 'https://helmlock-server.onrender.com';

// Locker rules. Keep these the same as the server settings
export const RULES = {
  openHour: 7, // lockers open at 7:00 AM
  closeHour: 21, // lockers close at 9:00 PM (helmets must be retrieved by then)
  dropOffFee: 5, // pesos to open the locker and store the helmet (IN)
  hourlyFee: 5, // pesos per reserved hour, paid at retrieval (OUT)
  lateFeePerHour: 5, // extra pesos per hour past the retrieval time
  arriveWindowMinutes: 15, // reservation expires if the helmet isn't stored this long after drop-off
  maxAdvanceMinutes: 60, // how far ahead a reservation can start
  maxStorageHours: 12, // longest storage time
  noShowLimit: 3, // missed reservations before a block
  blockHours: 24, // how long the block lasts
  maxLateFee: 50, // the late fee never goes above this
  lateGraceMinutes: 15, // being late up to this long is free
};