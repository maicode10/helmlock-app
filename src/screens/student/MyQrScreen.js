// Fig. 5 and 6: the IN (storage) and OUT (retrieval) QR codes
import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import LateNotice from '../../components/LateNotice';
import QrCard from '../../components/QrCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { RULES } from '../../config';
import { formatTime, fromNow } from '../../utils/format';
import { feesFor, peso } from '../../utils/pricing';
import { colors, radius } from '../../theme';

export default function MyQrScreen({ navigation }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.getMyQr());

  const r = data?.reservation;
  const showing = r?.status === 'reserved' ? 'in' : 'out';
  const qr = data ? data[showing] : null;
  const due = r ? (showing === 'in' ? RULES.dropOffFee : feesFor(r).due_at_retrieval) : 0;

  async function regenerate() {
    setBusy('regen');
    try {
      const res = await api.regenerateOutQr();
      setMessage(res.message);
      reload();
    } catch (e) {
      setMessage(e.message);
    }
    setConfirm(false);
    setBusy('');
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <ScreenHeader title="My QR" subtitle={r ? `Locker ${r.locker.number} · ${r.locker.location}` : 'Your storage and retrieval codes'} />

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : !r ? (
        <EmptyState icon="qr-code-outline" title="No active reservation" text="Reserve a locker first. Your IN and OUT QR codes will show here." actionTitle="Reserve a Locker" onAction={() => navigation.navigate('Reserve')} />
      ) : (
        <>
          {message ? <Notice kind="success" style={styles.gap}>{message}</Notice> : null}

          <Card style={styles.card}>
            <Text style={styles.kind}>{showing === 'in' ? 'Storage QR' : 'Retrieval QR'}</Text>
            <Text style={styles.steps}>Insert your coins, then scan this at Locker {r.locker.number}.</Text>
            <View style={styles.due}>
              <Text style={styles.dueLabel}>{showing === 'in' ? 'Pay at drop-off' : 'Pay at retrieval'}</Text>
              <Text style={styles.dueValue}>{peso(due)}</Text>
              {showing === 'out' ? (
                <Text style={styles.dueNote}>
                  {peso(RULES.hourlyFee)} × {feesFor(r).hours} hr{feesFor(r).late_fee ? ` + ${peso(feesFor(r).late_fee)} late fee` : ''}
                </Text>
              ) : null}
            </View>

            <View style={styles.qr}>
              <QrCard value={qr?.token} label={showing === 'in' ? 'IN · STORE HELMET' : 'OUT · GET HELMET'} used={!qr?.usable} />
            </View>

            {showing === 'in' ? (
              <Text style={styles.deadline}>
                Use before <Text style={styles.strong}>{formatTime(r.arrive_by)}</Text> ({fromNow(r.arrive_by)}) · works once
              </Text>
            ) : (
              <Text style={styles.deadline}>
                Retrieve by <Text style={styles.strong}>{formatTime(r.end_time)}</Text> ({fromNow(r.end_time)}) · works once
              </Text>
            )}
          </Card>

          <LateNotice reservation={r} style={styles.gap} />

          {showing === 'in' ? (
            <Notice kind="info" style={styles.gap}>Your OUT QR will show here after your helmet is stored.</Notice>
          ) : (
            <Button title="Lost your QR? Make a new one" variant="ghost" onPress={() => setConfirm(true)} style={styles.gapSmall} />
          )}

          <Text style={styles.tip}>Tip: turn your screen brightness up and hold your phone about a hand away from the scanner.</Text>

          <View style={styles.bottom} />
        </>
      )}

      <ConfirmDialog visible={confirm} title="Make a new OUT QR?" message="Your old OUT QR will stop working right away. Use this if you lost it or think someone else has it." confirmText="Make new QR" onConfirm={regenerate} onCancel={() => setConfirm(false)} loading={busy === 'regen'} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: 22 },
  kind: { fontSize: 18, fontWeight: '800', color: colors.text },
  steps: { marginTop: 4, fontSize: 14, color: colors.muted, textAlign: 'center' },
  due: { marginTop: 14, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius.md, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: colors.brandBorder },
  dueLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, color: colors.brandText, textTransform: 'uppercase' },
  dueValue: { fontSize: 26, fontWeight: '800', color: colors.text },
  dueNote: { fontSize: 12, color: colors.muted },
  qr: { marginTop: 18 },
  deadline: { marginTop: 14, fontSize: 13, color: colors.muted, textAlign: 'center' },
  strong: { fontWeight: '700', color: colors.text },
  gap: { marginTop: 14 },
  gapSmall: { marginTop: 8 },
  tip: { marginTop: 14, fontSize: 12, lineHeight: 18, color: colors.faint, textAlign: 'center' },
  bottom: { height: 16 },
});