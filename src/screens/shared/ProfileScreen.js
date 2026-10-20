// My Profile: change name/email, change password, help links, log out (students and admins)
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Flash from '../../components/Flash';
import ListItem from '../../components/ListItem';
import SectionTitle from '../../components/SectionTitle';
import StatusPill from '../../components/StatusPill';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { colors } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, signOut } = useAuth();
  const isAdmin = user.role === 'admin';

  const [details, setDetails] = useState({ name: user.name, email: user.email });
  const [detailErrors, setDetailErrors] = useState({});
  const [detailMsg, setDetailMsg] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwMsg, setPwMsg] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [confirmLogout, setConfirmLogout] = useState(false);

  async function saveDetails() {
    setDetailErrors({});
    setDetailMsg('');
    setSavingDetails(true);
    try {
      const res = await api.updateProfile(details);
      setUser(res.user);
      setDetailMsg(res.message);
    } catch (e) {
      setDetailErrors(e.errors || { name: [e.message] });
    }
    setSavingDetails(false);
  }

  async function savePassword() {
    setPwErrors({});
    setPwMsg('');
    setSavingPw(true);
    try {
      const res = await api.updatePassword(pw);
      setPwMsg(res.message);
      setPw({ current_password: '', password: '', password_confirmation: '' });
    } catch (e) {
      setPwErrors(e.errors || { current_password: [e.message] });
    }
    setSavingPw(false);
  }

  return (
    <Screen>
      <ScreenHeader back title="My Profile" />

      <View style={styles.me}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name[0]?.toUpperCase()}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.sub}>{isAdmin ? user.email : `Student ID ${user.student_id}`}</Text>
        </View>
        {isAdmin ? <StatusPill status="admin" /> : null}
      </View>

      <SectionTitle>Your details</SectionTitle>
      <Card style={styles.form}>
        <Flash message={detailMsg} />
        <TextField label="Full Name" icon="person-outline" value={details.name} onChangeText={(v) => setDetails({ ...details, name: v })} error={detailErrors.name?.[0]} autoCapitalize="words" />
        <TextField label="Email" icon="mail-outline" value={details.email} onChangeText={(v) => setDetails({ ...details, email: v })} error={detailErrors.email?.[0]} keyboardType="email-address" />
        {!isAdmin ? <Text style={styles.note}>Your student ID can't be changed. Contact the HelmLock team if it's wrong.</Text> : null}
        <Button title="Save details" onPress={saveDetails} loading={savingDetails} />
      </Card>

      <SectionTitle>Change password</SectionTitle>
      <Card style={styles.form}>
        <Flash message={pwMsg} />
        <TextField label="Current Password" icon="lock-closed-outline" value={pw.current_password} onChangeText={(v) => setPw({ ...pw, current_password: v })} error={pwErrors.current_password?.[0]} secureTextEntry />
        <TextField label="New Password" icon="lock-closed-outline" placeholder="At least 8 characters" value={pw.password} onChangeText={(v) => setPw({ ...pw, password: v })} error={pwErrors.password?.[0]} secureTextEntry />
        <TextField label="Confirm New Password" icon="lock-closed-outline" value={pw.password_confirmation} onChangeText={(v) => setPw({ ...pw, password_confirmation: v })} error={pwErrors.password_confirmation?.[0]} secureTextEntry />
        <Button title="Change password" variant="secondary" onPress={savePassword} loading={savingPw} />
      </Card>

      <SectionTitle>More</SectionTitle>
      <Card style={styles.menu}>
        <ListItem icon="help-circle-outline" title="Help & FAQ" onPress={() => navigation.navigate('Faq')} />
        <ListItem icon="document-text-outline" title="Terms and Rules" onPress={() => navigation.navigate('Terms')} />
        <ListItem icon="log-out-outline" title="Log out" danger last onPress={() => setConfirmLogout(true)} />
      </Card>
      <Text style={styles.version}>HelmLock v1.0 · USTP-CDO</Text>

      <ConfirmDialog visible={confirmLogout} title="Log out?" message="You'll need your email or student ID and password to log in again." confirmText="Log out" onConfirm={signOut} onCancel={() => setConfirmLogout(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  me: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandSoft },
  avatarText: { fontSize: 22, fontWeight: '800', color: colors.brandText },
  flex: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  sub: { marginTop: 2, fontSize: 13, color: colors.muted },
  form: { gap: 14 },
  note: { fontSize: 12, lineHeight: 18, color: colors.faint },
  menu: { paddingVertical: 4 },
  version: { marginTop: 20, marginBottom: 12, fontSize: 12, color: colors.faint, textAlign: 'center' },
});
