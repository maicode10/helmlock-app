// Admin accounts for each team member
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import Notice from '../../components/Notice';
import Loading from '../../components/Loading';
import SectionTitle from '../../components/SectionTitle';
import ConfirmDialog from '../../components/ConfirmDialog';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { colors } from '../../theme';

const EMPTY = { name: '', email: '', password: '', password_confirmation: '' };

export default function AdminTeamScreen() {
  const { data, loading, error, reload } = useLoad(() => api.adminTeam());
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [remove, setRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  const set = (key) => (v) => setForm({ ...form, [key]: v });

  async function add() {
    setErrors({});
    setNotice(null);
    setSaving(true);
    try {
      const res = await api.adminAddAdmin(form);
      setNotice({ kind: 'success', text: res.message });
      setForm(EMPTY);
      reload();
    } catch (e) {
      setErrors(e.errors || {});
    }
    setSaving(false);
  }

  async function doRemove() {
    setRemoving(true);
    try {
      const res = await api.adminRemoveAdmin(remove.id);
      setNotice({ kind: 'success', text: res.message });
      reload();
    } catch (e) {
      setNotice({ kind: 'danger', text: e.message });
    }
    setRemove(null);
    setRemoving(false);
  }

  return (
    <Screen>
      <ScreenHeader back title="Team" subtitle="Admin accounts for each HelmLock member. Each action in the activity log shows who did it." />

      {notice ? <Notice kind={notice.kind} style={styles.gap}>{notice.text}</Notice> : null}

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <View style={styles.list}>
          {data.admins.map((a) => (
            <Card key={a.id} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{a.name[0]}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name}>
                  {a.name}
                  {a.is_me ? <Text style={styles.you}>  (you)</Text> : null}
                </Text>
                <Text style={styles.small}>{a.email}</Text>
              </View>
              {!a.is_me ? <Button title="Remove" variant="secondary" style={styles.remove} onPress={() => setRemove(a)} /> : null}
            </Card>
          ))}
        </View>
      )}

      <SectionTitle>Add a team member</SectionTitle>
      <Card style={styles.form}>
        <TextField label="Full Name" icon="person-outline" value={form.name} onChangeText={set('name')} error={errors.name?.[0]} autoCapitalize="words" />
        <TextField label="Email" icon="mail-outline" value={form.email} onChangeText={set('email')} error={errors.email?.[0]} keyboardType="email-address" />
        <TextField label="Password" icon="lock-closed-outline" placeholder="At least 8 characters" value={form.password} onChangeText={set('password')} error={errors.password?.[0]} secureTextEntry />
        <TextField label="Confirm Password" icon="lock-closed-outline" value={form.password_confirmation} onChangeText={set('password_confirmation')} error={errors.password_confirmation?.[0]} secureTextEntry />
        <Button title="Add admin" icon="person-add-outline" onPress={add} loading={saving} />
        <Text style={styles.note}>Share the password privately. They can change it later in My Profile.</Text>
      </Card>

      <ConfirmDialog visible={!!remove} title="Remove this admin?" message={`${remove?.name} will no longer be able to log in as admin.`} confirmText="Remove" onConfirm={doRemove} onCancel={() => setRemove(null)} loading={removing} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 14 },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandSoft },
  avatarText: { fontSize: 15, fontWeight: '800', color: colors.brandText },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  you: { fontSize: 12, fontWeight: '400', color: colors.faint },
  small: { marginTop: 1, fontSize: 12, color: colors.muted },
  remove: { minHeight: 36, paddingHorizontal: 12 },
  form: { gap: 14, marginBottom: 16 },
  note: { fontSize: 12, color: colors.faint, textAlign: 'center' },
});
