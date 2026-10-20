import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { formatDateTime } from '../../utils/format';
import { colors } from '../../theme';

export default function AdminReportsScreen() {
  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminReports());
  const [busy, setBusy] = useState(null);

  async function toggle(id) {
    setBusy(id);
    try {
      await api.adminToggleReport(id);
      await reload();
    } catch (e) {
      // the list reloads below either way
    }
    setBusy(null);
  }

  const reports = data?.reports || [];
  const open = reports.filter((r) => r.status === 'open').length;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <ScreenHeader back title="Problem Reports" subtitle={data ? `${open} open · ${reports.length - open} resolved` : 'Messages from students'} />

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : reports.length === 0 ? (
        <EmptyState icon="flag-outline" title="No reports yet" text="When students report a locker problem, it shows here." />
      ) : (
        <View style={styles.list}>
          {reports.map((r) => (
            <Card key={r.id} style={r.status === 'resolved' && styles.resolved}>
              <View style={styles.top}>
                <Text style={styles.locker}>{r.locker ? `Locker ${r.locker}` : 'Locker not sure'}</Text>
                <StatusPill status={r.status} />
              </View>
              <Text style={styles.message}>{r.message}</Text>
              <Text style={styles.small}>
                {r.user ? `${r.user.name} (${r.user.student_id})` : 'Unknown'} · {formatDateTime(r.created_at)}
              </Text>
              <Button title={r.status === 'open' ? 'Mark as resolved' : 'Open again'} variant="secondary" onPress={() => toggle(r.id)} loading={busy === r.id} style={styles.button} />
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 16 },
  resolved: { opacity: 0.7 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locker: { fontSize: 15, fontWeight: '700', color: colors.text },
  message: { marginTop: 10, fontSize: 14, lineHeight: 21, color: colors.textSoft },
  small: { marginTop: 8, fontSize: 12, color: colors.muted },
  button: { marginTop: 12, minHeight: 42 },
});
