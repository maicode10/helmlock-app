import { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Backdrop from '../../components/Backdrop';
import ScreenHeader from '../../components/ScreenHeader';
import SearchBar from '../../components/SearchBar';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { RULES } from '../../config';
import { plural } from '../../utils/format';
import { colors, radius } from '../../theme';

export default function AdminStudentsScreen({ navigation }) {
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const focused = useIsFocused();

  useEffect(() => {
    const t = setTimeout(() => setQ(text), 350);
    return () => clearTimeout(t);
  }, [text]);

  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminStudents({ q }), [q]);
  const list = data?.students || [];

  // Refresh when coming back from a student's page (after block / unblock)
  useEffect(() => {
    if (focused && data) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

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
            <ScreenHeader title="Students" subtitle="Tap a student to see details, block, or unblock them." />
            <SearchBar value={text} onChangeText={setText} placeholder="Name, email, or mobile number" />
            {!loading && !error ? <Text style={styles.count}>{plural(list.length, 'student')}</Text> : null}
          </View>
        }
        ListEmptyComponent={loading || error ? <Loading error={error} onRetry={reload} /> : <EmptyState icon="people-outline" title="No students found" text="Try another search." />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item: s }) => (
          <Pressable onPress={() => navigation.navigate('AdminStudent', { student: s })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.top}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{s.name[0]}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.small} numberOfLines={1}>
                  {s.email}
                </Text>
              </View>
              {s.is_blocked ? <StatusPill status="blocked" /> : null}
              <Ionicons name="chevron-forward" size={18} color={colors.faint} />
            </View>
            <Text style={styles.stats}>
              {plural(s.total_reservations, 'reservation')} · {plural(s.no_shows, 'no-show')} · strikes {s.no_show_count}/{RULES.noShowLimit}
            </Text>
          </Pressable>
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
  header: { paddingBottom: 12 },
  pressed: { opacity: 0.8 },
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
});
