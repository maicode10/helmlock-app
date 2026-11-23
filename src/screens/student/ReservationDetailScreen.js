// Fig. 4: reservation summary (also shown right after reserving)
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import InfoRow from '../../components/InfoRow';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import LateNotice from '../../components/LateNotice';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { RULES } from '../../config';
import { formatDate, formatTime } from '../../utils/format';
import { feesFor, peso } from '../../utils/pricing';
import { LATE } from '../../utils/lateRules';
import { colors } from '../../theme';

export default function ReservationDetailScreen({ navigation, route }) {
  const { id, justReserved } = route.params;
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const { data, loading, error, reload } = useLoad(() => api.getReservation(id), [id]);
  const r = data?.reservation;
  const f = r ? feesFor(r) : null;

  async function cancel() {
    setBusy(true);
    try {
      const res = await api.cancelReservation(id);
      setMessage(res.message);
      setConfirm(false);
      reload();
    } catch (e) {
      setMessage(e.message);
      setConfirm(false);
    }
    setBusy(false);
  }

  // Go back to the tabs (instead of opening a second copy of them)
  const goQr = () => navigation.popTo('StudentTabs', { screen: 'MyQR' });

  return (
    <Screen>
      <ScreenHeader back title="Reservation" />

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <>
          {justReserved && r.status === 'reserved' ? (
            <View style={styles.success}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={30} color={colors.green} />
              </View>
              <Text style={styles.successTitle}>Reservation confirmed!</Text>
              <Text style={styles.successText}>Your locker is saved for you. Show your IN QR at the locker.</Text>
            </View>
          ) : null}

          {message ? <Notice kind="success" style={styles.gap}>{message}</Notice> : null}

          <Card style={styles.card}>
            <View style={styles.top}>
              <View>
                <Text style={styles.small}>Locker</Text>
                <Text style={styles.locker}>#{r.locker.number}</Text>
                <Text style={styles.small}>{r.locker.location}</Text>
              </View>
              <StatusPill status={r.is_late ? 'late' : r.status} />
            </View>

            <View style={styles.rows}>
              <InfoRow label="Date" value={formatDate(r.start_time)} />
              <InfoRow label="Drop-off" value={formatTime(r.start_time)} />
              <InfoRow label="Retrieve by" value={formatTime(r.end_time)} last={r.status !== 'reserved' && !r.stored_at} />
              {r.status === 'reserved' ? <InfoRow label="Store before" value={formatTime(r.arrive_by)} last /> : null}
              {r.stored_at ? <InfoRow label="Stored at" value={formatTime(r.stored_at)} last={!r.retrieved_at} /> : null}
              {r.retrieved_at ? <InfoRow label="Retrieved at" value={formatTime(r.retrieved_at)} last /> : null}
            </View>
          </Card>

          {['reserved', 'stored', 'completed'].includes(r.status) ? (
            <Card style={styles.feeCard}>
              <Text style={styles.feeTitle}>{r.status === 'completed' ? 'You paid' : 'Price'}</Text>
              <InfoRow label="Drop-off (IN)" value={peso(f.drop_off)} />
              <InfoRow label={`Retrieval (OUT) · ${f.hours} hr`} value={peso(f.retrieval)} last={!f.late_fee} />
              {f.late_fee ? <InfoRow label={f.overnight ? 'Late fee · overnight' : `Late fee · ${f.late_hours} hr`} value={peso(f.late_fee)} last /> : null}
              <View style={styles.feeTotal}>
                <Text style={styles.feeTotalLabel}>Total</Text>
                <Text style={styles.feeTotalValue}>{peso(f.total)}</Text>
              </View>
            </Card>
          ) : null}

          {r.status === 'reserved' ? (
            <>
              <Notice kind="warning" style={styles.gap}>
                Store your helmet before {formatTime(r.arrive_by)}, or the reservation expires and counts as missed.
              </Notice>
              <Button title="Show my IN QR" icon="qr-code-outline" onPress={goQr} style={styles.gap} />
              <Button title="Cancel reservation" variant="ghost" onPress={() => setConfirm(true)} />
            </>
          ) : r.status === 'stored' ? (
            <>
              <LateNotice reservation={r} style={styles.gap} />
              <Button title="Show my OUT QR" icon="qr-code-outline" onPress={goQr} style={styles.gap} />
            </>
          ) : (
            <Button title="Back to Home" variant="secondary" onPress={() => navigation.popTo('StudentTabs', { screen: 'Home' })} style={styles.gap} />
          )}

          <Text style={styles.fee}>
            Paid in ₱5 coins at the locker. Late? The first {LATE.graceMinutes} minutes are free, then +{peso(LATE.perHour)} per hour, max {peso(LATE.max)} (overnight: {peso(LATE.max)}).
          </Text>
        </>
      )}

      <ConfirmDialog visible={confirm} title="Cancel this reservation?" message="Your locker will be freed for other students. This won't count as a missed reservation." confirmText="Cancel it" cancelText="Keep it" onConfirm={cancel} onCancel={() => setConfirm(false)} loading={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: { alignItems: 'center', marginBottom: 20 },
  successIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenSoft },
  successTitle: { marginTop: 12, fontSize: 20, fontWeight: '800', color: colors.text },
  successText: { marginTop: 4, fontSize: 14, color: colors.muted, textAlign: 'center' },
  card: { padding: 18 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  small: { fontSize: 12, color: colors.muted },
  locker: { fontSize: 34, fontWeight: '800', color: colors.text },
  rows: { marginTop: 12 },
  gap: { marginTop: 14 },
  feeCard: { marginTop: 14, paddingVertical: 14 },
  feeTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  feeTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
  feeTotalLabel: { fontSize: 15, fontWeight: '700', color: colors.text },
  feeTotalValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  fee: { marginTop: 18, lineHeight: 18, fontSize: 12, color: colors.faint, textAlign: 'center' },
});
