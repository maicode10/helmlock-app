import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { formatTime } from '../../utils/format';
import { colors } from '../../theme';

export default function AdminLockersScreen({ navigation }) {
  const { data, loading, error, reload, refreshing, refresh } = useLoad(() => api.adminLockers());
  const [notice, setNotice] = useState(null); // { lockerId, kind, text } shown inside that locker's card
  const [busy, setBusy] = useState(null);
  const [release, setRelease] = useState(null); // locker to release

  async function run(locker, fn) {
    setBusy(locker.id);
    setNotice(null);
    try {
      const res = await fn();
      setNotice({ lockerId: locker.id, kind: 'success', text: res.message });
      reload();
    } catch (e) {
      setNotice({ lockerId: locker.id, kind: 'danger', text: e.message });
    }
    setBusy(null);
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      <ScreenHeader title="Lockers" subtitle="Set lockers out of service, release them after using the manual key, or add new ones." right="add" rightLabel="Add a locker" onRightPress={() => navigation.navigate('AdminLockerForm')} />

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <View style={styles.list}>
          {data.lockers.map((l) => (
            <Card key={l.id}>
              <View style={styles.top}>
                <View style={styles.flex}>
                  <Text style={styles.name}>Locker {l.number}</Text>
                  <Text style={styles.small}>
                    {l.location}
                    {l.is_physical ? ' · Real locker' : ''}
                  </Text>
                </View>
                <StatusPill status={l.status} />
              </View>

              <View style={styles.current}>
                {l.current ? (
                  <>
                    <Text style={styles.who}>{l.current.user.name}</Text>
                    <Text style={styles.small}>
                      {l.current.user.mobile || l.current.user.email} · {formatTime(l.current.start_time)} – {formatTime(l.current.end_time)}
                    </Text>
                    {l.current.is_late ? <Text style={styles.late}>Late: past retrieval time</Text> : null}
                  </>
                ) : (
                  <Text style={styles.small}>{l.status === 'out_of_service' ? 'Not available to students.' : 'Free.'}</Text>
                )}
              </View>

              <View style={styles.actions}>
                <Button title="Edit" variant="secondary" style={styles.action} onPress={() => navigation.navigate('AdminLockerForm', { locker: l })} />
                {l.status === 'available' ? (
                  <Button title="Out of service" variant="secondary" style={styles.action} loading={busy === l.id} onPress={() => run(l, () => api.adminSetLockerStatus(l.id, 'out_of_service'))} />
                ) : l.status === 'out_of_service' ? (
                  <Button title="Set available" style={styles.action} loading={busy === l.id} onPress={() => run(l, () => api.adminSetLockerStatus(l.id, 'available'))} />
                ) : (
                  <Button title="Release" style={styles.action} loading={busy === l.id} onPress={() => setRelease(l)} />
                )}
              </View>

              {notice?.lockerId === l.id ? <Notice kind={notice.kind} style={styles.notice}>{notice.text}</Notice> : null}
            </Card>
          ))}

          <Card style={styles.help}>
            <Text style={styles.helpTitle}>When to use each button</Text>
            <Text style={styles.helpText}>• Out of service: the locker is broken. Students can't reserve it.</Text>
            <Text style={styles.helpText}>• Set available: the locker is fixed.</Text>
            <Text style={styles.helpText}>• Release: you opened it with the manual key (power outage, jam). This ends the reservation and frees it.</Text>
          </Card>
        </View>
      )}

      <ConfirmDialog
        visible={!!release}
        title={release ? `Release Locker ${release.number}?` : ''}
        message="This ends the current reservation and frees the locker. Use this after opening it with the manual key."
        confirmText="Release"
        onCancel={() => setRelease(null)}
        loading={busy === release?.id}
        onConfirm={async () => {
          const l = release;
          await run(l, () => api.adminReleaseLocker(l.id));
          setRelease(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: 12 },
  list: { gap: 12, paddingBottom: 16 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  flex: { flex: 1 },
  name: { fontSize: 17, fontWeight: '800', color: colors.text },
  small: { fontSize: 12, lineHeight: 17, color: colors.muted },
  current: { marginTop: 10, minHeight: 20 },
  who: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  late: { marginTop: 2, fontSize: 12, fontWeight: '600', color: colors.brandText },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  action: { flex: 1, minHeight: 42 },
  help: { gap: 6 },
  helpTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 2 },
  helpText: { fontSize: 13, lineHeight: 19, color: colors.muted },
});