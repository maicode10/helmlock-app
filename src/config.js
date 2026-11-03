// HelmLock app settings.

// true  = use the fake backend inside the app (no server needed)
// false = use the real Laravel backend at API_URL
export const USE_FAKE_API = true;

// Your friend's Laravel backend.
// Same WiFi testing: http://YOUR-LAPTOP-IP:8000   Online: https://your-app.up.railway.app
export const API_URL = 'http://192.168.1.10:8000';

// Show the "Testing only" buttons that pretend to be the locker (scan IN/OUT, make me late).
// Turn this off once the real ESP32 locker is working.
export const DEMO_TOOLS = true;

// Locker rules (same numbers as config/helmlock.php in Laravel)
export const RULES = {
  dropOffFee: 5, // pesos to open the locker and store the helmet (IN)
  hourlyFee: 5, // pesos per reserved hour, paid at retrieval (OUT)
  lateFeePerHour: 5, // extra pesos per hour past the retrieval time
  lateGraceMinutes: 30, // being late up to this long is free
  arriveWindowMinutes: 15, // reservation expires if the helmet isn't stored this long after drop-off
  maxAdvanceMinutes: 60, // how far ahead a reservation can start
  maxStorageHours: 12, // longest storage time
  noShowLimit: 3, // missed reservations before a block
  blockHours: 24, // how long the block lasts
};