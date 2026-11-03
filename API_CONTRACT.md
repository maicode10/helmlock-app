# HelmLock API Contract

This is the list of every request the HelmLock app sends, and what the Laravel backend must answer.
The app already works with a fake backend (`src/api/fake.js`) that follows these exact shapes.
When the real backend is ready, set `USE_FAKE_API = false` and `API_URL` in `src/config.js`.

The rules already exist in the Laravel project (`app/Services/LockerService.php`, `config/helmlock.php`).
The backend job is mostly: **add token login (Laravel Sanctum) and JSON routes that call the existing logic.**

---

## Basics

- **Base URL:** `{API_URL}/api` (example: `http://192.168.1.10:8000/api`)
- **Headers on every request:** `Accept: application/json`, `Content-Type: application/json`
- **Logged-in requests:** `Authorization: Bearer {token}` (Laravel Sanctum personal access tokens)
- **Dates:** ISO 8601 strings, e.g. `"2026-10-20T09:05:00+08:00"`. App timezone: `Asia/Manila`.
- **Times sent by the app** when reserving: `"HH:mm"` for **today**, e.g. `"09:05"`.

### Errors (same as Laravel's default)
| Status | When | Body |
|---|---|---|
| 422 | Form or rule error | `{ "message": "...", "errors": { "field": ["message"] } }` |
| 401 | Not logged in / bad token | `{ "message": "Unauthenticated." }` |
| 403 | Student calling an admin route | `{ "message": "Admins only." }` |
| 404 | Not found, or not the student's own reservation | `{ "message": "..." }` |
| 429 | Too many tries (throttle) | `{ "message": "..." }` |

For **rule errors** (already reserved, blocked, locker taken), send 422 with the field the app shows it under.
Example: `{ "message": "You already have an active reservation.", "errors": { "locker_id": ["You already have an active reservation."] } }`

---

## Shared objects

**User**
```json
{ "id": 2, "name": "Juan Dela Cruz", "student_id": "2023123456", "email": "student@helmlock.test",
  "role": "student", "no_show_count": 1, "blocked_until": null, "created_at": "..." }
```
`role` is `student` or `admin`. Admins have `student_id: null`.

**Reservation**
```json
{ "id": 15, "locker": { "id": 2, "number": "02", "location": "USTP CDO Campus" },
  "start_time": "...", "end_time": "...", "arrive_by": "...",
  "status": "reserved", "stored_at": null, "retrieved_at": null,
  "is_late": false, "created_at": "...",
  "fees": { "hours": 3, "late_hours": 0, "drop_off": 5, "retrieval": 15, "late_fee": 0,
            "due_at_retrieval": 15, "total": 20 } }
```
`status`: `reserved` | `stored` | `completed` | `expired` | `cancelled`.
`is_late` = status is `stored` and now is past `end_time`.

**Pricing (the `fees` object).** Compute it the same way as `src/utils/pricing.js`:
- `hours` = reserved hours, rounded up: `ceil((end_time - start_time) / 60 min)`, at least 1.
- `drop_off` = ₱5 (paid at the locker when the helmet is stored).
- `retrieval` = `hours × ₱5` (paid at the locker when the helmet is taken out).
- `late_hours` = 0 if the helmet is taken out at most 30 minutes after `end_time`; otherwise `ceil(minutes late / 60)`.
  Count late time up to now while `stored`, and up to `retrieved_at` once `completed`. Always 0 for other statuses.
- `late_fee` = `late_hours × ₱5`. `due_at_retrieval` = `retrieval + late_fee`. `total` = `drop_off + due_at_retrieval`.
- Put these numbers in `config/helmlock.php`: `drop_off_fee 5`, `hourly_fee 5`, `late_fee_per_hour 5`, `late_grace_minutes 30`.
  The ESP32 must ask for `due_at_retrieval` in coins before it opens the door on an OUT scan.

In admin lists, add `"user": { "id": 2, "name": "...", "student_id": "..." }`.

**QR**
```json
{ "type": "in", "token": "64-character random hex", "used_at": null, "usable": true }
```

**Scan result** (same shape the ESP32 API returns)
```json
{ "ok": true, "action": "store", "message": "Door open. Store your helmet.",
  "lcd": ["Door open", "Store helmet"], "locker": "02" }
```
`action`: `store` | `retrieve` | `null`. A `retrieve` result also has `"paid": 20, "late_fee": 5` (pesos paid at retrieval and how much of it was the late fee).

---

## Auth (no token needed except logout/me)

| Method | Path | Send | Answer |
|---|---|---|---|
| POST | `/login` | `{ login, password }` (login = email or student ID) | `{ token, user }` |
| POST | `/register` | `{ name, student_id, email, password, password_confirmation, terms: true }` | `{ token, user }` |
| POST | `/logout` | – | `{ ok: true }` (delete the current token) |
| GET | `/me` | – | `{ user }` |
| POST | `/forgot-password` | `{ login }` | `{ message }` (always the same message; email a **6-digit code**, valid 60 min) |
| POST | `/reset-password` | `{ login, code, password, password_confirmation }` | `{ message }` (422 on `code` if wrong/expired) |

> There is no website anymore, so forgot password uses a 6-digit code by email instead of a link.

## Profile (students and admins)
| Method | Path | Send | Answer |
|---|---|---|---|
| PUT | `/profile` | `{ name, email }` | `{ message, user }` |
| PUT | `/profile/password` | `{ current_password, password, password_confirmation }` | `{ message }` |

## Student
| Method | Path | Send | Answer |
|---|---|---|---|
| GET | `/home` | – | `{ user, active_reservation: Reservation\|null, available_count }` |
| GET | `/lockers` | – | `{ lockers: [{ id, number, location, status }] }` (hide `out_of_service`) |
| POST | `/reservations` | `{ locker_id, start_time: "HH:mm", end_time: "HH:mm" }` | `{ message, reservation }` (creates IN + OUT QR) |
| GET | `/reservations` | – | `{ reservations: [Reservation] }` (newest first) |
| GET | `/reservations/{id}` | – | `{ reservation }` (404 if not theirs) |
| POST | `/reservations/{id}/cancel` | – | `{ message }` (only when `reserved`) |
| GET | `/qr` | – | `{ reservation, in: QR, out: QR }` or all `null` when no active reservation |
| POST | `/qr/out/regenerate` | – | `{ message, out: QR }` (only when `stored`; old OUT QR stops working) |
| GET | `/reports/lockers` | – | `{ lockers: [{ id, number }] }` |
| POST | `/reports` | `{ locker_id: number\|null, message }` | `{ message }` (min 10 characters) |

Call `LockerService::expireOverdue()` at the start of `/home`, `/lockers`, `/reservations`, `/qr` (same as the website did).

### Testing only (allow when `HELMLOCK_DEMO=true` or local)
| Method | Path | Answer |
|---|---|---|
| POST | `/dev/scan/{in\|out}` | Scan result (use `LockerService::scan()` with the student's active QR token) |
| POST | `/dev/late` | `{ ok, message }` (move the active stored reservation back so `end_time` is 45 minutes ago, keeping its length) |

## Admin (role must be `admin`, otherwise 403)
| Method | Path | Send | Answer |
|---|---|---|---|
| GET | `/admin/dashboard` | – | see below |
| GET | `/admin/lockers` | – | `{ lockers: [{ id, number, location, status, is_physical, current: Reservation+user\|null, history_count }] }` |
| POST | `/admin/lockers` | `{ number, location }` | `{ message, locker }` |
| PUT | `/admin/lockers/{id}` | `{ number, location }` | `{ message, locker }` |
| DELETE | `/admin/lockers/{id}` | – | `{ message }` (refuse if physical, in use, or has history) |
| POST | `/admin/lockers/{id}/status` | `{ status: "available"\|"out_of_service" }` | `{ message }` |
| POST | `/admin/lockers/{id}/release` | – | `{ message }` (manual key: end reservation, free locker) |
| GET | `/admin/reservations?status=&q=` | – | `{ reservations: [Reservation+user] }` (max 100, newest first) |
| GET | `/admin/students?q=` | – | `{ students: [User + is_blocked, total_reservations, completed, no_shows] }` |
| POST | `/admin/students/{id}/unblock` | – | `{ message }` (clear `blocked_until` and `no_show_count`) |
| GET | `/admin/reports` | – | `{ reports: [{ id, message, status, created_at, locker: "02"\|null, user: { name, student_id } }] }` (open first) |
| POST | `/admin/reports/{id}/toggle` | – | `{ message }` (open ⇄ resolved) |
| GET | `/admin/team` | – | `{ admins: [User + is_me] }` |
| POST | `/admin/team` | `{ name, email, password, password_confirmation }` | `{ message }` |
| DELETE | `/admin/team/{id}` | – | `{ message }` (not yourself, keep at least 1 admin) |
| GET | `/admin/export?type=&from=YYYY-MM-DD&to=YYYY-MM-DD` | – | `{ filename, rows, csv }` (type: `daily`, `hours`, `activity`, `reservations`, `students`; reuse the website's ExportController logic but return the CSV text) |

**Dashboard answer**
```json
{ "lockers": { "available": 4, "reserved": 0, "occupied": 1, "out_of_service": 1 },
  "active_reservations": 1, "students": 5, "uses_today": 3, "money_today": 30, "money_total": 295,
  "total_uses": 26, "open_reports": 1, "late": 0,
  "busiest_hours": [{ "hour": 8, "uses": 9 }],
  "recent": [{ "id": 1, "action": "stored", "details": "Helmet stored", "amount": 5,
               "created_at": "...", "user": "Ana Reyes", "admin": null, "locker": "03" }] }
```

---

## Not changed
The ESP32 locker API (`/api/locker/status`, `/scan`, `/extend`, `/door` with the `X-Locker-Key` header) stays exactly as it is.