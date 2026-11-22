// HelmLock app settings.

// true  = use the fake backend inside the app (no server needed)
// false = use the real Laravel backend at API_URL
export const USE_FAKE_API = false;

// Your friend's Laravel backend.
// Same WiFi: http://YOUR-LAPTOP-IP:8000   Online: https://your-app.up.railway.app
export const API_URL = 'https://helmlock-server.onrender.com';

// Locker rules (same numbers as config/helmlock.php in Laravel)
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
  lateGraceMinutes: 15, // being late up to this long is free
};