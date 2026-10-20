// Add a new locker, or edit / delete an existing one
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import SectionTitle from '../../components/SectionTitle';
import ConfirmDialog from '../../components/ConfirmDialog';
import api from '../../api';
import { colors } from '../../theme';

export default function AdminLockerFormScreen({ navigation, route }) {
  const locker = route.params?.locker; // empty = adding a new one
  const editing = !!locker;

  const [number, setNumber] = useState(locker?.number || '');
  const [location, setLocation] = useState(locker?.location || '');
  const [errors, setErrors] = useState({});
  const [failMsg, setFailMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setErrors({});
    setFailMsg('');
    setSaving(true);
    try {
      if (editing) await api.adminUpdateLocker(locker.id, { number, location });
      else await api.adminAddLocker({ number, location });
      navigation.goBack();
    } catch (e) {
      setErrors(e.errors || {});
      if (!e.errors || !Object.keys(e.errors).length) setFailMsg(e.message);
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api.adminDeleteLocker(locker.id);
      navigation.goBack();
    } catch (e) {
      setFailMsg(e.message);
      setConfirmDelete(false);
      setDeleting(false);
    }
  }

  // Why a locker can't be deleted
  const cantDelete = !editing
    ? null
    : locker.is_physical
    ? "This is the real ESP32 locker, so it can't be deleted."
    : ['reserved', 'occupied'].includes(locker.status)
    ? 'This locker is in use. Release it first.'
    : locker.history_count > 0
    ? `This locker has ${locker.history_count} reservation${locker.history_count === 1 ? '' : 's'} in its history. Deleting it would erase records used in reports, so set it Out of Service instead.`
    : null;

  return (
    <Screen>
      <ScreenHeader back title={editing ? `Edit Locker ${locker.number}` : 'Add a Locker'} subtitle={editing ? 'Change the locker number or where it is placed.' : 'New lockers start as Available.'} />

      {failMsg ? <Notice kind="danger" style={styles.gap}>{failMsg}</Notice> : null}

      <Card style={styles.form}>
        <TextField label="Locker number" icon="keypad-outline" placeholder="Example: 07" value={number} onChangeText={setNumber} error={errors.number?.[0]} maxLength={10} />
        {editing && locker.is_physical ? <Text style={styles.warn}>This is the real ESP32 locker. If you change its number, change it in the ESP32 code too.</Text> : null}
        <TextField label="Location" icon="location-outline" placeholder="USTP CDO Campus" value={location} onChangeText={setLocation} error={errors.location?.[0]} autoCapitalize="words" maxLength={100} />
        <Button title={editing ? 'Save changes' : 'Add locker'} onPress={save} loading={saving} />
      </Card>

      {editing ? (
        <>
          <SectionTitle>Delete locker</SectionTitle>
          <Card style={styles.form}>
            {cantDelete ? (
              <Text style={styles.text}>{cantDelete}</Text>
            ) : (
              <>
                <Text style={styles.text}>This locker was never used, so it can be deleted.</Text>
                <Button title="Delete locker" variant="secondary" icon="trash-outline" onPress={() => setConfirmDelete(true)} />
              </>
            )}
          </Card>
        </>
      ) : null}

      <ConfirmDialog visible={confirmDelete} title={`Delete Locker ${locker?.number}?`} message="This can't be undone." confirmText="Delete" onConfirm={remove} onCancel={() => setConfirmDelete(false)} loading={deleting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 14 },
  form: { gap: 14 },
  warn: { marginTop: -6, fontSize: 12, lineHeight: 18, color: colors.amber },
  text: { fontSize: 14, lineHeight: 20, color: colors.muted },
});
