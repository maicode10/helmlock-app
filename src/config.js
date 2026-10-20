// HelmLock app settings.

// true  = use the fake backend inside the app (no server needed)
// false = use the real Laravel backend at API_URL
export const USE_FAKE_API = true;

// Your friend's Laravel backend.
// Same WiFi testing: http://YOUR-LAPTOP-IP:8000   Online: https://your-app.up.railway.app
export const API_URL = 'http://192.168.1.10:8000';

// Show the "Testing only" buttons that pretend to be the locker (scan IN/OUT, pay extension).
// Turn this off once the real ESP32 locker is working.
export const DEMO_TOOLS = true;

// Locker rules (same numbers as config/helmlock.php in Laravel)
export const RULES = {
  fee: 5, // pesos per scan, for both IN and OUT
  extensionFee: 10, // pesos to extend when late
  extensionMinutes: 60, // how much time one extension adds
  arriveWindowMinutes: 15, // reservation expires if the helmet isn't stored this long after drop-off
  maxAdvanceMinutes: 60, // how far ahead a reservation can start
  maxStorageHours: 12, // longest storage time
  noShowLimit: 3, // missed reservations before a block
  blockHours: 24, // how long the block lasts
};
