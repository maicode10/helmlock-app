// Late fee rules, in their own file with NO imports,
// so every screen can read them safely (no circular-import problems).
export const LATE = {
  graceMinutes: 15, // being late up to this long is free
  perHour: 5, // pesos per late hour
  max: 50, // the late fee never goes above this, and it is the flat overnight fee
};
