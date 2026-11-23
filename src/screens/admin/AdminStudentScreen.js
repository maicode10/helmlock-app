// One student's details. The admin can block (any time, any reason) or unblock them.
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import InfoRow from '../../components/InfoRow';
import StatusPill from '../../components/StatusPill';
import SectionTitle from '../../components/SectionTitle';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api';
import { RULES } from '../../config';
import { formatDate, formatDateTime } from '../../utils/format';
import { colors } from '../../theme';

// How long a block lasts. null = until an admin unblocks them.
const LENGTHS = [
  ['1 day', 24],
  ['7 days', 24 * 7],
  ['30 days', 24 * 30],
  ['Until I unblock', null],
];

// A block date this far away means "until unblocked"
const isForever = (date) => !!date && new Date(date).getFullYear() >= 2099;

export default function AdminStudentScreen({ route }) {
  const [student, setStudent] = useState(route.params.student);
  const [lengthIndex, setLengthIndex] = useState(0);
  const [confirm, setConfirm] = useState(null); // 'block' or 'unblock'
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const s = student;
  const canBlock = typeof api.adminBlockStudent === 'function';

  async function doBlock() {
    setBusy(true);
    try {
      const hours = LENGTHS[lengthIndex][1];
      const res = await api.adminBlockStudent(s.id, hours);
      const until = hours ? new Date(Date.now() + hours * 3600000).toISOString() : '2099-12-31T23:59:59.000Z';
      setStudent({ ...s, is_blocked: true, blocked_until: res?.blocked_until || until });
      setNotice({ kind: 'success', text: res?.message || `${s.name} is blocked.` });
    } catch (e) {
      setNotice({ kind: 'danger', text: e.message });
    }
    setConfirm(null);
    setBusy(false);
  }

  async function doUnblock() {
    setBusy(true);
    try {
      const res = await api.adminUnblockStudent(s.id);
      setStudent({ ...s, is_blocked: false, blocked_until: null, no_show_count: 0 });
      setNotice({ kind: 'success', text: res?.message || `${s.name} can reserve again.` });
    } catch (e) {
      setNotice({ kind: 'danger', text: e.message });
    }
    setConfirm(null);
    setBusy(false);
  }

  return (
    <Screen>
      <ScreenHeader title={s.name} subtitle="Student" back />

      {notice ? <Notice kind={notice.kind} style={styles.gap}>{notice.text}</Notice> : null}

      <Card style={styles.gap}>
        <View style={styles.top}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{s.name[0]}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{s.name}</Text>
            <Text style={styles.small}>{s.email}</Text>
          </View>
          <StatusPill status={s.is_blocked ? 'blocked' : 'available'} />
        </View>
        <View style={styles.rows}>
          <InfoRow label="Mobile" value={s.mobile || '-'} />
          {s.created_at ? <InfoRow label="Joined" value={formatDate(s.created_at)} /> : null}
          <InfoRow label="Reservations" value={String(s.total_reservations ?? 0)} />
          <InfoRow label="Completed" value={String(s.completed ?? 0)} />
          <InfoRow label="No-shows" value={String(s.no_shows ?? 0)} />
          <InfoRow label="Strikes" value={`${s.no_show_count ?? 0}/${RULES.noShowLimit}`} last />
        </View>
      </Card>

      {s.is_blocked ? (
        <>
          <SectionTitle>Blocked</SectionTitle>
          <Card style={styles.gap}>
            <Text style={styles.blockedText}>
              {isForever(s.blocked_until) ? 'Blocked until an admin unblocks them.' : `Blocked until ${formatDateTime(s.blocked_until)}.`}
            </Text>
            <Text style={styles.help}>They can't make new reservations while blocked.</Text>
            <Button title="Unblock student" icon="lock-open-outline" onPress={() => setConfirm('unblock')} style={styles.button} />
          </Card>
        </>
      ) : (
        <>
          <SectionTitle>Block this student</SectionTitle>
          <Card style={styles.gap}>
            <Text style={styles.help}>A blocked student can't make new reservations. Pick how long:</Text>
            <View style={styles.chips}>
              {LENGTHS.map(([label], i) => (
                <Chip key={label} label={label} selected={i === lengthIndex} onPress={() => setLengthIndex(i)} />
              ))}
            </View>
            {canBlock ? (
              <Button title="Block student" icon="ban-outline" onPress={() => setConfirm('block')} style={styles.button} />
            ) : (
              <Notice kind="warning" style={styles.button}>Blocking needs adminBlockStudent in the API. See ADD_TO_API.txt.</Notice>
            )}
          </Card>
        </>
      )}

      <ConfirmDialog
        visible={confirm === 'block'}
        title={`Block ${s.name}?`}
        message={LENGTHS[lengthIndex][1] ? `They can't reserve for ${LENGTHS[lengthIndex][0]}.` : "They can't reserve until you unblock them."}
        confirmText="Block"
        onConfirm={doBlock}
        onCancel={() => setConfirm(null)}
        loading={busy}
      />
      <ConfirmDialog
        visible={confirm === 'unblock'}
        title={`Unblock ${s.name}?`}
        message="They can reserve again right away, and their missed-reservation count goes back to 0."
        confirmText="Unblock"
        onConfirm={doUnblock}
        onCancel={() => setConfirm(null)}
        loading={busy}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 16 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.text },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  small: { marginTop: 2, fontSize: 12, color: colors.muted },
  rows: { marginTop: 12 },
  blockedText: { fontSize: 15, fontWeight: '700', color: colors.brandText },
  help: { marginTop: 4, fontSize: 13, lineHeight: 19, color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  button: { marginTop: 16 },
});
