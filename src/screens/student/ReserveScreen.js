// Fig. 3: pick a drop-off time (Now or Later), how long (- / +), and a locker
import { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import SectionTitle from '../../components/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { RULES } from '../../config';
import { formatDateTime, formatTime, toHHmm } from '../../utils/format';
import { peso, quote } from '../../utils/pricing';
import { LATE } from '../../utils/lateRules';
import { colors, radius } from '../../theme';

// "Later" drop-off choices, in minutes from now
const LATER = [15, 30, 45, 60].filter((m) => m <= RULES.maxAdvanceMinutes);

const MIN_HOURS = 1;
const MAX_HOURS = RULES.maxStorageHours;

const STATUS_TEXT = { available: 'Free', reserved: 'Reserved', occupied: 'Occupied' };

// Opening hours: 7:00 AM to 9:00 PM
const OPEN = RULES.openHour * 60; // in minutes after midnight
const CLOSE = RULES.closeHour * 60;
const hourLabel = (h) => `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
const OPEN_TEXT = `${hourLabel(RULES.openHour)} to ${hourLabel(RULES.closeHour)}`;
const minutesOf = (d) => d.getHours() * 60 + d.getMinutes();
const isToday = (d) => d.toDateString() === new Date().toDateString();

// A drop-off time is allowed if it's today, after opening, and leaves at least 1 hour before closing
const startOk = (d) => isToday(d) && minutesOf(d) >= OPEN && minutesOf(d) + 60 <= CLOSE;

// Drop-off time for a chip: now, or now + X minutes rounded to the next 5 minutes
function startFor(minutes) {
  const d = new Date();
  d.setSeconds(0, 0);
  if (minutes > 0) {
    d.setMinutes(d.getMinutes() + minutes);
    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  }
  return d;
}

export default function ReserveScreen({ navigation }) {
  const { user } = useAuth();
  const [mode, setMode] = useState('now'); // 'now' or 'later'
  const [laterIndex, setLaterIndex] = useState(0);
  const [hours, setHours] = useState(3);
  const [lockerId, setLockerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data, loading, error: loadError, reload, refreshing, refresh } = useLoad(async () => {
    const [home, lockers] = await Promise.all([api.getHome(), api.getLockers()]);
    return { active: home.active_reservation, lockers: lockers.lockers };
  });

  const nowStart = useMemo(() => startFor(0), [data]);
  const laterTimes = useMemo(() => LATER.map((m) => startFor(m)), [data]);
  const start = mode === 'now' ? nowStart : laterTimes[laterIndex];
  const end = useMemo(() => new Date(start.getTime() + hours * 3600000), [start, hours]);
  const nowOk = startOk(nowStart);
  const firstLater = laterTimes.findIndex(startOk);

  // Retrieval must be by closing time (9:00 PM)
  const fitsToday = (h) => {
    const e = new Date(start.getTime() + h * 3600000);
    return e.toDateString() === start.toDateString() && minutesOf(e) <= CLOSE;
  };

  // If the chosen drop-off time is outside opening hours, switch to one that's allowed
  useEffect(() => {
    if (startOk(start)) return;
    if (mode === 'now' && firstLater >= 0) {
      setMode('later');
      setLaterIndex(firstLater);
    } else if (mode === 'later' && firstLater >= 0) {
      setLaterIndex(firstLater);
    } else if (nowOk) {
      setMode('now');
    }
  }, [nowStart, laterTimes]);

  // Late in the day, long stays no longer fit before closing. Lower the hours to the most that fits.
  useEffect(() => {
    if (!fitsToday(hours)) {
      let h = hours;
      while (h > MIN_HOURS && !fitsToday(h)) h -= 1;
      setHours(h);
    }
  }, [start]);

  const canLess = hours > MIN_HOURS;
  const canMore = hours < MAX_HOURS && fitsToday(hours + 1);

  function pickLater() {
    setMode('later');
    if (!startOk(laterTimes[laterIndex]) && firstLater >= 0) setLaterIndex(firstLater);
  }

  const closed = !nowOk && firstLater < 0;

  const price = quote(hours);
  const blocked = user.blocked_until && new Date(user.blocked_until) > new Date();

  async function reserve() {
    setError('');
    setSaving(true);
    try {
      const res = await api.createReservation({ locker_id: lockerId, start_time: toHHmm(start), end_time: toHHmm(end) });
      setLockerId(null);
      navigation.navigate('ReservationDetail', { id: res.reservation.id, justReserved: true });
    } catch (e) {
      setError(Object.values(e.errors || {})[0]?.[0] || e.message);
      reload();
    }
    setSaving(false);
  }

  if (loading) return <Screen><ScreenHeader title="Reserve a Locker" /><Loading /></Screen>;
  if (loadError) return <Screen><ScreenHeader title="Reserve a Locker" /><Loading error={loadError} onRetry={reload} /></Screen>;

  // Already has a reservation
  if (data.active) {
    return (
      <Screen>
        <ScreenHeader title="Reserve a Locker" />
        <EmptyState icon="checkmark-circle-outline" title="You already have a reservation" text={`Locker ${data.active.locker.number}, ${formatTime(data.active.start_time)} to ${formatTime(data.active.end_time)}. You can only have one at a time.`} actionTitle="View my reservation" onAction={() => navigation.navigate('ReservationDetail', { id: data.active.id })} />
      </Screen>
    );
  }

  // Outside opening hours
  if (closed) {
    return (
      <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
        <ScreenHeader title="Reserve a Locker" />
        <EmptyState icon="moon-outline" title="Lockers are closed" text={`HelmLock is open from ${OPEN_TEXT}. You can reserve starting ${hourLabel(RULES.openHour - 1)} for a ${hourLabel(RULES.openHour)} drop-off.`} actionTitle="Check again" onAction={reload} />
      </Screen>
    );
  }

  const freeCount = data.lockers.filter((l) => l.status === 'available').length;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <ScreenHeader title="Reserve a Locker" subtitle="Choose when you'll drop off your helmet and pick a free locker." />

      {blocked ? (
        <Notice kind="danger">Reserving is paused until {formatDateTime(user.blocked_until)} because of missed reservations.</Notice>
      ) : null}

      <Card style={styles.when}>
        <Text style={styles.label}>DROP-OFF</Text>
        <View style={styles.toggle}>
          <Pressable disabled={!nowOk} onPress={() => setMode('now')} style={[styles.tg, mode === 'now' && styles.tgOn, !nowOk && styles.off]} accessibilityState={{ selected: mode === 'now', disabled: !nowOk }}>
            <Text style={[styles.tgTitle, mode === 'now' && styles.tgTitleOn]}>Now</Text>
            <Text style={[styles.tgSub, mode === 'now' && styles.tgSubOn]}>{formatTime(nowStart)}</Text>
          </Pressable>
          <Pressable disabled={firstLater < 0} onPress={pickLater} style={[styles.tg, mode === 'later' && styles.tgOn, firstLater < 0 && styles.off]} accessibilityState={{ selected: mode === 'later', disabled: firstLater < 0 }}>
            <Text style={[styles.tgTitle, mode === 'later' && styles.tgTitleOn]}>Later</Text>
            <Text style={[styles.tgSub, mode === 'later' && styles.tgSubOn]}>pick a time</Text>
          </Pressable>
        </View>

        {mode === 'later' ? (
          <View style={styles.laterRow}>
            {laterTimes.map((t, i) => {
              const ok = startOk(t);
              const on = i === laterIndex;
              return (
                <Pressable key={LATER[i]} disabled={!ok} onPress={() => setLaterIndex(i)} style={[styles.lt, on && styles.ltOn, !ok && styles.off]} accessibilityLabel={`Drop off at ${formatTime(t)}`}>
                  <Text style={styles.ltText}>{formatTime(t).replace(/\s?[AP]M$/i, '')}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.label}>HOW LONG</Text>
        <View style={styles.stepper}>
          <Pressable disabled={!canLess} onPress={() => setHours((h) => h - 1)} style={[styles.stepBtn, !canLess && styles.off]} hitSlop={6} accessibilityLabel="Less time">
            <Ionicons name="remove" size={26} color={colors.text} />
          </Pressable>
          <View style={styles.stepMid}>
            <Text style={styles.stepNum}>{hours}</Text>
            <Text style={styles.stepSub}>{hours > 1 ? 'hours' : 'hour'} · {peso(price.retrieval)} at pick-up</Text>
          </View>
          <Pressable disabled={!canMore} onPress={() => setHours((h) => h + 1)} style={[styles.stepBtn, styles.stepBtnRed, !canMore && styles.off]} hitSlop={6} accessibilityLabel="More time">
            <Ionicons name="add" size={26} color="#ffffff" />
          </Pressable>
        </View>
      </Card>

      <Card style={styles.summary}>
        <View style={styles.timeCol}>
          <Text style={styles.small}>Drop off</Text>
          <Text style={styles.time}>{formatTime(start)}</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.faint} />
        <View style={[styles.timeCol, styles.right]}>
          <Text style={styles.small}>Retrieve by</Text>
          <Text style={[styles.time, !fitsToday(hours) && styles.bad]}>{formatTime(end)}</Text>
        </View>
      </Card>
      <Text style={styles.note}>Open {OPEN_TEXT} · Store your helmet within {RULES.arriveWindowMinutes} min of drop-off</Text>

      <SectionTitle right={<Text style={styles.small}>{freeCount} free</Text>}>Choose a locker</SectionTitle>
      {data.lockers.length === 0 ? (
        <Notice kind="info">No lockers are open right now.</Notice>
      ) : (
        <View style={styles.lockers}>
          {data.lockers.map((l) => {
            const free = l.status === 'available';
            const selected = l.id === lockerId;
            return (
              <Pressable key={l.id} disabled={!free} onPress={() => setLockerId(l.id)} style={[styles.locker, selected && styles.lockerSelected, !free && styles.lockerTaken]} accessibilityLabel={`Locker ${l.number}, ${STATUS_TEXT[l.status]}`}>
                <Text style={[styles.lockerNo, !free && styles.takenText]}>{l.number}</Text>
                <View style={styles.lockerStatus}>
                  <View style={[styles.dot, { backgroundColor: free ? colors.green : l.status === 'reserved' ? colors.amber : colors.brandText }]} />
                  <Text style={styles.lockerText}>{STATUS_TEXT[l.status]}</Text>
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.brandBright} style={styles.check} /> : null}
              </Pressable>
            );
          })}
        </View>
      )}

      <Card style={styles.price}>
        <Text style={styles.priceTitle}>Price for {hours} hour{hours > 1 ? 's' : ''}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>At drop-off (IN)</Text>
          <Text style={styles.priceValue}>{peso(price.dropOff)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>At retrieval (OUT) · {peso(RULES.hourlyFee)} × {hours} hr</Text>
          <Text style={styles.priceValue}>{peso(price.retrieval)}</Text>
        </View>
        <View style={[styles.priceRow, styles.priceTotal]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{peso(price.total)}</Text>
        </View>
        <Text style={styles.priceNote}>Paid in ₱5 coins at the locker. Late? The first {LATE.graceMinutes} minutes are free, then +{peso(LATE.perHour)} per hour, max {peso(LATE.max)} (overnight: {peso(LATE.max)}).</Text>
      </Card>

      {error ? <Notice kind="danger" style={styles.error}>{error}</Notice> : null}

      <Button title={lockerId ? 'Reserve Locker ' + data.lockers.find((l) => l.id === lockerId)?.number : 'Choose a locker'} onPress={reserve} loading={saving} disabled={!lockerId || blocked || !startOk(start) || !fitsToday(hours)} style={styles.reserve} />
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  when: { marginTop: 4 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: colors.faint },
  toggle: { flexDirection: 'row', marginTop: 10, padding: 4, borderRadius: 14, backgroundColor: colors.surface2, gap: 4 },
  tg: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 11 },
  tgOn: { backgroundColor: colors.brand },
  tgTitle: { fontSize: 15, fontWeight: '800', color: colors.muted },
  tgTitleOn: { color: '#ffffff' },
  tgSub: { marginTop: 1, fontSize: 11, color: colors.faint },
  tgSubOn: { color: 'rgba(255,255,255,0.85)' },
  laterRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  lt: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.surface2, borderWidth: 1, borderColor: 'transparent' },
  ltOn: { borderColor: colors.brandBright, backgroundColor: colors.brandSoft },
  ltText: { fontSize: 14, fontWeight: '700', color: colors.text },
  off: { opacity: 0.3 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  stepBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  stepBtnRed: { backgroundColor: colors.brand },
  stepMid: { alignItems: 'center' },
  stepNum: { fontSize: 34, fontWeight: '800', color: colors.text, lineHeight: 38 },
  stepSub: { fontSize: 12, color: colors.muted },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  timeCol: { gap: 2 },
  right: { alignItems: 'flex-end' },
  small: { fontSize: 12, color: colors.muted },
  time: { fontSize: 22, fontWeight: '800', color: colors.text },
  bad: { color: colors.brandText },
  note: { marginTop: 8, fontSize: 12, lineHeight: 18, color: colors.faint },
  lockers: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  locker: { width: '31%', flexGrow: 1, paddingVertical: 16, paddingHorizontal: 12, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line },
  lockerSelected: { borderColor: colors.brandBright, backgroundColor: colors.brandSoft },
  lockerTaken: { opacity: 0.45 },
  lockerNo: { fontSize: 22, fontWeight: '800', color: colors.text },
  takenText: { color: colors.muted },
  lockerStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  lockerText: { fontSize: 12, color: colors.muted },
  check: { position: 'absolute', top: 8, right: 8 },
  price: { marginTop: 18, gap: 8 },
  priceTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  priceLabel: { flex: 1, fontSize: 13, color: colors.muted },
  priceValue: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  priceTotal: { marginTop: 2, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  priceNote: { marginTop: 2, fontSize: 12, lineHeight: 17, color: colors.faint },
  error: { marginTop: 14 },
  reserve: { marginTop: 16 },
  bottom: { height: 16 },
});
