import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { formatDay, formatTime, plural } from '../../utils/format';
import { colors, radius } from '../../theme';

export default function HistoryScreen({ navigation }) {
  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.getHistory());
  const list = data?.reservations || [];
  const done = list.filter((r) => r.status === 'completed').length;

  const header = (
    <ScreenHeader title="History" subtitle={list.length ? `${plural(list.length, 'reservation')} · ${done} completed` : 'Your past reservations'} right="flag-outline" rightLabel="Report a problem" onRightPress={() => navigation.navigate('Report')} />
  );

  if (loading || error) {
    return (
      <Screen>
        {header}
        <Loading error={error} onRetry={reload} />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={list}
        keyExtractor={(r) => String(r.id)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}
        ListEmptyComponent={<EmptyState icon="time-outline" title="No reservations yet" text="Your reservations will show here after you use HelmLock." actionTitle="Reserve a Locker" onAction={() => navigation.navigate('Reserve')} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item: r }) => (
          <Pressable onPress={() => navigation.navigate('ReservationDetail', { id: r.id })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{r.locker.number}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.date}>{formatDay(r.start_time)}</Text>
              <Text style={styles.times}>
                {formatTime(r.start_time)} – {formatTime(r.end_time)}
                {r.extensions ? ` · ${plural(r.extensions, 'extension')}` : ''}
              </Text>
            </View>
            <StatusPill status={r.is_late ? 'late' : r.status} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ink },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  sep: { height: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.75 },
  badge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  badgeText: { fontSize: 15, fontWeight: '800', color: colors.text },
  flex: { flex: 1 },
  date: { fontSize: 15, fontWeight: '600', color: colors.text },
  times: { marginTop: 2, fontSize: 13, color: colors.muted },
});
