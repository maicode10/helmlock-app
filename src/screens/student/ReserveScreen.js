// Fig. 3: pick a drop-off time, how long, and a locker
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
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
import { colors, radius } from '../../theme';

const STARTS = [
  { label: 'Now', minutes: 0 },
  { label: '+15 min', minutes: 15 },
  { label: '+30 min', minutes: 30 },
  { label: '+45 min', minutes: 45 },
  { label: '+60 min', minutes: 60 },
].filter((s) => s.minutes <= RULES.maxAdvanceMinutes);

const LENGTHS = [1, 2, 3, 4, 6, 8, 12].filter((h) => h <= RULES.maxStorageHours);

const STATUS_TEXT = { available: 'Free', reserved: 'Reserved', occupied: 'Occupied' };

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
  const [startIndex, setStartIndex] = useState(0);
  const [hours, setHours] = useState(3);
  const [lockerId, setLockerId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data, loading, error: loadError, reload, refreshing, refresh } = useLoad(async () => {
    const [home, lockers] = await Promise.all([api.getHome(), api.getLockers()]);
    return { active: home.active_reservation, lockers: lockers.lockers };
  });

  const start = useMemo(() => startFor(STARTS[startIndex].minutes), [startIndex, data]);
  const end = useMemo(() => new Date(start.getTime() + hours * 3600000), [start, hours]);

  // Retrieval must stay within the same day
  const fitsToday = (h) => {
    const e = new Date(start.getTime() + h * 3600000);
    return e.getDate() === start.getDate() && toHHmm(e) <= '23:55';
  };

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

  const freeCount = data.lockers.filter((l) => l.status === 'available').length;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <ScreenHeader title="Reserve a Locker" subtitle="Choose when you'll drop off your helmet and pick a free locker." />

      {blocked ? (
        <Notice kind="danger">Reserving is paused until {formatDateTime(user.blocked_until)} because of missed reservations.</Notice>
      ) : null}

      <SectionTitle>1. Drop-off time</SectionTitle>
      <View style={styles.chips}>
        {STARTS.map((s, i) => (
          <Chip key={s.label} label={s.label} selected={i === startIndex} onPress={() => setStartIndex(i)} />
        ))}
      </View>

      <SectionTitle>2. How long?</SectionTitle>
      <View style={styles.chips}>
        {LENGTHS.map((h) => (
          <Chip key={h} label={`${h} hr${h > 1 ? 's' : ''}`} selected={h === hours} disabled={!fitsToday(h)} onPress={() => setHours(h)} />
        ))}
      </View>

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
      <Text style={styles.note}>Store your helmet within {RULES.arriveWindowMinutes} minutes of drop-off, or the reservation expires.</Text>

      <SectionTitle right={<Text style={styles.small}>{freeCount} free</Text>}>3. Choose a locker</SectionTitle>
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
        <Text style={styles.priceNote}>Paid in ₱5 coins at the locker. Late? The first {RULES.lateGraceMinutes} minutes are free, then +{peso(RULES.lateFeePerHour)} per hour.</Text>
      </Card>

      {error ? <Notice kind="danger" style={styles.error}>{error}</Notice> : null}

      <Button title={lockerId ? 'Reserve Locker ' + data.lockers.find((l) => l.id === lockerId)?.number : 'Choose a locker'} onPress={reserve} loading={saving} disabled={!lockerId || blocked || !fitsToday(hours)} style={styles.reserve} />
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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