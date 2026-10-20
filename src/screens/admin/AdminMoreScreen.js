import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import ListItem from '../../components/ListItem';
import SectionTitle from '../../components/SectionTitle';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { colors } from '../../theme';

export default function AdminMoreScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const { data } = useLoad(() => api.adminReports());
  const open = data?.reports.filter((r) => r.status === 'open').length || 0;

  return (
    <Screen>
      <ScreenHeader title="More" />

      <Pressable onPress={() => navigation.navigate('Profile')} style={({ pressed }) => [pressed && styles.pressed]}>
        <Card style={styles.me}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name[0]}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.small}>{user.email} · My Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.faint} />
        </Card>
      </Pressable>

      <SectionTitle>Manage</SectionTitle>
      <Card style={styles.menu}>
        <ListItem icon="flag-outline" title="Problem Reports" subtitle="Messages from students" badge={open || null} onPress={() => navigation.navigate('AdminReports')} />
        <ListItem icon="people-circle-outline" title="Team" subtitle="Admin accounts for each member" onPress={() => navigation.navigate('AdminTeam')} />
        <ListItem icon="download-outline" title="Export Data" subtitle="Daily summary, peak hours, payments" last onPress={() => navigation.navigate('AdminExport')} />
      </Card>

      <SectionTitle>Help</SectionTitle>
      <Card style={styles.menu}>
        <ListItem icon="help-circle-outline" title="Help & FAQ" onPress={() => navigation.navigate('Faq')} />
        <ListItem icon="document-text-outline" title="Terms and Rules" onPress={() => navigation.navigate('Terms')} />
        <ListItem icon="log-out-outline" title="Log out" danger last onPress={() => setConfirm(true)} />
      </Card>
      <Text style={styles.version}>HelmLock Admin v1.0</Text>

      <ConfirmDialog visible={confirm} title="Log out?" confirmText="Log out" onConfirm={signOut} onCancel={() => setConfirm(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.8 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandSoft },
  avatarText: { fontSize: 18, fontWeight: '800', color: colors.brandText },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  small: { marginTop: 2, fontSize: 12, color: colors.muted },
  menu: { paddingVertical: 4 },
  version: { marginTop: 20, marginBottom: 12, fontSize: 12, color: colors.faint, textAlign: 'center' },
});
