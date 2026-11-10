import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Backdrop from '../../components/Backdrop';
import ScreenHeader from '../../components/ScreenHeader';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { RULES } from '../../config';
import { formatDateTime, plural } from '../../utils/format';
import { colors, radius } from '../../theme';

export default function AdminStudentsScreen() {
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const [unblock, setUnblock] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setQ(text), 350);
    return () => clearTimeout(t);
  }, [text]);

  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminStudents({ q }), [q]);
  const list = data?.students || [];

  async function doUnblock() {
    setBusy(true);
    try {
      const res = await api.adminUnblockStudent(unblock.id);
      setNotice(res.message);
      reload();
    } catch (e) {
      setNotice(e.message);
    }
    setUnblock(null);
    setBusy(false);
  }

  return (
    <View style={styles.root}>
      <Backdrop />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <FlatList
          data={loading || error ? [] : list}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}
          ListHeaderComponent={
            <View style={styles.header}>
              <ScreenHeader title="Students" subtitle={`Students are paused for ${RULES.blockHours} hours after ${RULES.noShowLimit} missed reservations. You can unblock them early.`} />
              <SearchBar value={text} onChangeText={setText} placeholder="Name, email, or mobile number" />
              {notice ? <Notice kind="success" style={styles.notice}>{notice}</Notice> : null}
              {!loading && !error ? <Text style={styles.count}>{plural(list.length, 'student')}</Text> : null}
            </View>
          }
          ListEmptyComponent={loading || error ? <Loading error={error} onRetry={reload} /> : <EmptyState icon="people-outline" title="No students found" text="Try another search." />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item: s }) => (
            <View style={styles.row}>
              <View style={styles.top}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{s.name[0]}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.name}>{s.name}</Text>
                  <Text style={styles.small}>
                    {s.email}{s.mobile ? ` · ${s.mobile}` : ''}
                  </Text>
                </View>
                {s.is_blocked ? <StatusPill status="blocked" /> : null}
              </View>
              <Text style={styles.stats}>
                {plural(s.total_reservations, 'reservation')} · {s.completed} completed · {plural(s.no_shows, 'no-show')} · strikes {s.no_show_count}/{RULES.noShowLimit}
              </Text>
              {s.is_blocked ? (
                <View style={styles.blockRow}>
                  <Text style={styles.blocked}>Paused until {formatDateTime(s.blocked_until)}</Text>
                  <Button title="Unblock" variant="secondary" style={styles.unblock} onPress={() => setUnblock(s)} />
                </View>
              ) : null}
            </View>
          )}
        />

        <ConfirmDialog visible={!!unblock} title={`Unblock ${unblock?.name}?`} message="They can reserve again right away, and their missed-reservation count goes back to 0." confirmText="Unblock" onConfirm={doUnblock} onCancel={() => setUnblock(null)} loading={busy} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  header: { paddingBottom: 12 },
  notice: { marginTop: 12 },
  count: { marginTop: 12, fontSize: 12, color: colors.faint },
  sep: { height: 10 },
  row: { padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  avatarText: { fontSize: 15, fontWeight: '700', color: colors.text },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  small: { marginTop: 1, fontSize: 12, color: colors.muted },
  stats: { marginTop: 10, fontSize: 12, lineHeight: 18, color: colors.faint },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  blocked: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.brandText },
  unblock: { minHeight: 38, paddingHorizontal: 14 },
});