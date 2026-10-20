import { useEffect } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import StatTile from '../../components/StatTile';
import InfoRow from '../../components/InfoRow';
import Loading from '../../components/Loading';
import SectionTitle from '../../components/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { formatDateTime, peso, plural } from '../../utils/format';
import { colors } from '../../theme';

const hourLabel = (h) => `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`;
const actionLabel = (a) => (a.charAt(0).toUpperCase() + a.slice(1)).replace(/_/g, ' ');

export default function AdminOverviewScreen({ navigation }) {
  const { user } = useAuth();
  const focused = useIsFocused();
  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminDashboard());

  // Refresh every 30 seconds while this screen is open
  useEffect(() => {
    if (!focused) return undefined;
    const timer = setInterval(reload, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <View style={styles.top}>
        <Logo size="small" />
        <Text style={styles.badge}>ADMIN</Text>
      </View>
      <Text style={styles.title}>Overview</Text>
      <Text style={styles.sub}>Hi, {user.name.split(' ')[0]}. Pull down to refresh.</Text>

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <>
          <SectionTitle>Lockers right now</SectionTitle>
          <View style={styles.grid}>
            <StatTile label="Available" value={data.lockers.available} color={colors.green} />
            <StatTile label="Reserved" value={data.lockers.reserved} color={colors.amber} />
            <StatTile label="Occupied" value={data.lockers.occupied} color={colors.brandText} />
            <StatTile label="Out of service" value={data.lockers.out_of_service} color={colors.muted} />
          </View>

          <SectionTitle>Today</SectionTitle>
          <View style={styles.grid}>
            <StatTile label="Uses today" value={data.uses_today} icon="pulse-outline" />
            <StatTile label="Collected today" value={peso(data.money_today)} icon="cash-outline" />
            <StatTile label="Collected total" value={peso(data.money_total)} icon="wallet-outline" />
            <StatTile label="Students" value={data.students} icon="people-outline" />
          </View>

          <SectionTitle>At a glance</SectionTitle>
          <Card style={styles.list}>
            <InfoRow label="Active reservations" value={data.active_reservations} />
            <InfoRow label="Late right now" value={data.late} />
            <InfoRow label="Total helmets stored" value={data.total_uses} />
            <Pressable onPress={() => navigation.navigate('AdminReports')}>
              <InfoRow label="Open problem reports" value={data.open_reports ? `${data.open_reports}  ›` : '0'} last />
            </Pressable>
          </Card>

          <SectionTitle>Busiest hours</SectionTitle>
          <Card style={styles.list}>
            {data.busiest_hours.length ? (
              data.busiest_hours.map((b, i) => <InfoRow key={b.hour} label={hourLabel(b.hour)} value={plural(b.uses, 'use')} last={i === data.busiest_hours.length - 1} />)
            ) : (
              <Text style={styles.empty}>No data yet.</Text>
            )}
          </Card>

          <SectionTitle>Recent activity</SectionTitle>
          <Card style={styles.list}>
            {data.recent.length ? (
              data.recent.map((log, i) => (
                <View key={log.id} style={[styles.log, i < data.recent.length - 1 && styles.logBorder]}>
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
          <View style={styles.bottom} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.brandSoft, color: colors.brandText, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  title: { marginTop: 20, fontSize: 28, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  list: { paddingVertical: 4 },
  empty: { paddingVertical: 12, fontSize: 14, color: colors.muted },
  log: { flexDirection: 'row', gap: 10, paddingVertical: 11 },
  logBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  logIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, marginTop: 1 },
  flex: { flex: 1 },
  logTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  money: { color: colors.green, fontWeight: '700' },
  logSub: { marginTop: 2, fontSize: 12, lineHeight: 17, color: colors.muted },
  bottom: { height: 16 },
});
