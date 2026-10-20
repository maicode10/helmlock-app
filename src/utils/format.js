// Simple date and time formatting (works the same on every phone)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const toDate = (value) => (value instanceof Date ? value : new Date(value));

// 9:05 AM
export function formatTime(value) {
  if (!value) return '-';
  const d = toDate(value);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

// Oct 20, 2026
export function formatDate(value) {
  if (!value) return '-';
  const d = toDate(value);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Tue, Oct 20
export function formatDay(value) {
  const d = toDate(value);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Oct 20, 9:05 AM
export function formatDateTime(value) {
  if (!value) return '-';
  const d = toDate(value);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${formatTime(d)}`;
}

// "HH:mm" for the backend
export function toHHmm(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// "2026-10-20"
export function toYmd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "in 25 min", "in 2 hr 10 min", "5 min ago"
export function fromNow(value) {
  const diff = Math.round((toDate(value).getTime() - Date.now()) / 60000);
  const abs = Math.abs(diff);
  const text = abs < 60 ? `${abs} min` : `${Math.floor(abs / 60)} hr${abs % 60 ? ` ${abs % 60} min` : ''}`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
}

export function peso(amount) {
  return '₱' + Number(amount || 0).toLocaleString('en-US');
}

export function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}
