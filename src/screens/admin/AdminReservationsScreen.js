import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Backdrop from '../../components/Backdrop';
import ScreenHeader from '../../components/ScreenHeader';
import SearchBar from '../../components/SearchBar';
import Chip from '../../components/Chip';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { formatDay, formatTime, plural } from '../../utils/format';
import { feesFor, peso } from '../../utils/pricing';
import { colors, radius } from '../../theme';

const FILTERS = [
  ['', 'All'],
  ['reserved', 'Reserved'],
  ['stored', 'Stored'],
  ['completed', 'Completed'],
  ['expired', 'Expired'],
  ['cancelled', 'Cancelled'],
];

export default function AdminReservationsScreen() {
  const [status, setStatus] = useState('');
  const [text, setText] = useState('');
  const [q, setQ] = useState('');

  // Wait until the admin stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => setQ(text), 350);
    return () => clearTimeout(t);
  }, [text]);

  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminReservations({ status, q }), [status, q]);
  const list = data?.reservations || [];

  return (
    <View style={styles.root}>
      <Backdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <FlatList
          data={loading || error ? [] : list}
          keyExtractor={(r) => String(r.id)}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}
          ListHeaderComponent={
            <View>
              <ScreenHeader title="Reservations" subtitle="Every reservation, newest first." />
              <SearchBar value={text} onChangeText={setText} placeholder="Name, student ID, or locker" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
                {FILTERS.map(([value, label]) => (
                  <Chip key={label} label={label} selected={status === value} onPress={() => setStatus(value)} />
                ))}
              </ScrollView>
              {!loading && !error ? <Text style={styles.count}>{plural(list.length, 'result')}</Text> : null}
            </View>
          }
          ListEmptyComponent={loading || error ? <Loading error={error} onRetry={reload} /> : <EmptyState icon="search-outline" title="No reservations found" text="Try another search or filter." />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item: r }) => (
            <View style={styles.row}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{r.locker.number}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name}>{r.user.name}</Text>
                <Text style={styles.small}>{r.user.student_id}</Text>
                <Text style={styles.small}>
                  {formatDay(r.start_time)} · {formatTime(r.start_time)} – {formatTime(r.end_time)}
                  {r.status === 'completed' ? ` · ${peso(feesFor(r).total)}${feesFor(r).late_fee ? ' (late)' : ''}` : ''}
                </Text>
              </View>
              <StatusPill status={r.is_late ? 'late' : r.status} />
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  filters: { gap: 8, paddingVertical: 14 },
  count: { marginBottom: 10, fontSize: 12, color: colors.faint },
  sep: { height: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  badge: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  badgeText: { fontSize: 15, fontWeight: '800', color: colors.text },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  small: { marginTop: 1, fontSize: 12, color: colors.muted },
});