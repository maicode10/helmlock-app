// All recent activity (the Overview only shows the newest 5)
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { formatDateTime, peso } from '../../utils/format';
import { colors } from '../../theme';

const actionLabel = (a) => (a.charAt(0).toUpperCase() + a.slice(1)).replace(/_/g, ' ');

export default function AdminActivityScreen() {
  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminDashboard());
  const logs = data?.recent || [];

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <ScreenHeader title="Recent activity" subtitle="Newest first. For older records, use Export Data." back />

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <Card style={styles.list}>
          {logs.length ? (
            logs.map((log, i) => (
              <View key={log.id} style={[styles.log, i < logs.length - 1 && styles.logBorder]}>
                <View style={styles.logIcon}>
                  <Ionicons name={log.amount ? 'cash-outline' : 'ellipse-outline'} size={14} color={log.amount ? colors.green : colors.faint} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.logTitle}>
                    {actionLabel(log.action)}
                    {log.amount ? <Text style={styles.money}>  +{peso(log.amount)}</Text> : null}
                  </Text>
                  <Text style={styles.logSub}>
                    {formatDateTime(log.created_at)}
                    {log.locker ? ` · Locker ${log.locker}` : ''}
                    {log.user ? ` · ${log.user}` : ''}
                    {log.admin ? ` · by ${log.admin}` : ''}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No activity yet.</Text>
          )}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 4, marginBottom: 16 },
  empty: { paddingVertical: 12, fontSize: 14, color: colors.muted },
  log: { flexDirection: 'row', gap: 10, paddingVertical: 11 },
  logBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  logIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, marginTop: 1 },
  flex: { flex: 1 },
  logTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  money: { color: colors.green, fontWeight: '700' },
  logSub: { marginTop: 2, fontSize: 12, lineHeight: 17, color: colors.muted },
});
