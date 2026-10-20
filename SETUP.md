# HelmLock App: How to run it

Expo SDK 58 · React Native · works with a built-in fake backend (no server needed yet)

## 1. Put the project on your laptop
1. Extract `helmlock-app.zip` into `C:\Projects\` so you get `C:\Projects\helmlock-app`.
2. Open PowerShell:
   ```powershell
   cd C:\Projects\helmlock-app
   npm install
   npx expo install --fix
   ```
   `npm install` downloads the libraries (needs internet, takes a few minutes).
   `npx expo install --fix` makes sure every library matches your Expo version.

## 2. Run it
```powershell
npx expo start
```
- **Phone:** install or update **Expo Go** from the Play Store, then scan the QR code in the terminal (phone and laptop on the same WiFi).
- **Emulator:** open the Android Studio emulator, then press **a** in the terminal.
- If your phone can't connect on the same WiFi, run `npx expo start --tunnel` instead.

## 3. Demo accounts (fake backend)
| Who | Login | Password |
|---|---|---|
| Student | `2023123456` | `password` |
| Blocked student | `liza.cruz@gmail.com` | `password` |
| Admin | `admin@helmlock.test` | `password` |
| Forgot password code | `123456` | |

The fake backend **resets every time the app reloads**. That's normal.

## 4. Things to try
**Student:** Reserve a locker → Reservation confirmed → My QR → "Scan IN QR at the locker" (Testing only) → Helmet stored → OUT QR → "Make my time run out" → scan OUT → Storage time expired → Pay extension → scan OUT → Locker opened. Also: History, Report a problem, Profile, Help & FAQ, cancel a reservation.

**Admin:** Overview, Lockers (add / edit / delete / out of service / release), Bookings (search + filter), Students (unblock), More → Problem Reports, Team, Export Data.

## 5. Where things are
| What | File |
|---|---|
| Colors | `src/theme.js` |
| Fees, times, fake/real switch, demo buttons | `src/config.js` |
| Fake backend | `src/api/fake.js` |
| Real backend client (for later) | `src/api/real.js` |
| Endpoint list for the backend friend | `API_CONTRACT.md` |
| Student screens | `src/screens/student/` |
| Admin screens | `src/screens/admin/` |
| Login, sign up, forgot password | `src/screens/auth/` |
| Bottom menus and screen list | `src/navigation/` |

## 6. When the real backend is ready
1. Give `API_CONTRACT.md` to your backend friend.
2. In `src/config.js`, set `USE_FAKE_API = false` and set `API_URL` to the server:
   - same WiFi: `http://YOUR-LAPTOP-IP:8000` (run Laravel with `php artisan serve --host=0.0.0.0`)
   - online: `https://your-app.up.railway.app`
3. When the real ESP32 locker works, set `DEMO_TOOLS = false` to hide the "Testing only" buttons.

## 7. If something goes wrong
| Problem | Fix |
|---|---|
| "Project is incompatible with this version of Expo Go" | Update Expo Go from the Play Store. |
| "Unable to resolve module ..." | Run `npm install` again, then `npx expo start --clear`. |
| Phone stuck on "Opening project..." | Same WiFi on both, or use `npx expo start --tunnel`. |
| Red error screen | Screenshot it and send it. |
