import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import StatusPill from '../../components/StatusPill';
import Loading from '../../components/Loading';
import SectionTitle from '../../components/SectionTitle';
import { useAuth } from '../../context/AuthContext';
import useLoad from '../../hooks/useLoad';
import api from '../../api';
import { RULES } from '../../config';
import { formatDateTime, formatTime, fromNow } from '../../utils/format';
import { colors, radius } from '../../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const ACTIONS = [
  { icon: 'calendar-outline', title: 'Reserve', text: 'Pick a locker', go: ['Reserve'] },
  { icon: 'qr-code-outline', title: 'My QR', text: 'Store or retrieve', go: ['MyQR'] },
  { icon: 'time-outline', title: 'History', text: 'Past reservations', go: ['History'] },
  { icon: 'flag-outline', title: 'Report', text: 'Locker problem?', go: ['Report'] },
];

export default function HomeScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const { data, loading, error, reload, refreshing, refresh } = useLoad(async () => {
    const res = await api.getHome();
    setUser(res.user); // keep no-show count and block up to date
    return res;
  });

  const firstName = user.name.split(' ')[0];
  const active = data?.active_reservation;
  const blocked = user.blocked_until && new Date(user.blocked_until) > new Date();

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brandBright} colors={[colors.brand]} />}>
      {/* Top bar */}
      <View style={styles.top}>
        <Logo size="small" />
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.avatar} accessibilityLabel="My profile">
          <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </Pressable>
      </View>

      <Text style={styles.hello}>{greeting()},</Text>
      <Text style={styles.name}>{firstName}!</Text>

      {loading ? (
        <Loading />
      ) : error ? (
        <Loading error={error} onRetry={reload} />
      ) : (
        <>
          {/* Current reservation, or available lockers */}
          {active ? (
            <Card style={styles.main}>
              <View style={styles.mainTop}>
                <View>
                  <Text style={styles.small}>Your locker</Text>
                  <Text style={styles.lockerNo}>#{active.locker.number}</Text>
                </View>
                <StatusPill status={active.is_late ? 'late' : active.status} />
              </View>

              <Text style={styles.times}>
                {formatTime(active.start_time)} to {formatTime(active.end_time)}
              </Text>

              {active.status === 'reserved' ? (
                <Notice kind="warning" style={styles.notice}>
                  Store your helmet before {formatTime(active.arrive_by)} ({fromNow(active.arrive_by)}).
                </Notice>
              ) : active.is_late ? (
                <Notice kind="danger" style={styles.notice}>
                  Your time is over. Pay the ₱{RULES.extensionFee} extension at the locker to get your helmet.
                </Notice>
              ) : (
                <Text style={styles.hint}>Retrieve by {formatTime(active.end_time)} ({fromNow(active.end_time)}).</Text>
              )}

              <View style={styles.buttons}>
                <Button title={active.status === 'reserved' ? 'Show my IN QR' : 'Show my OUT QR'} icon="qr-code-outline" onPress={() => navigation.navigate('MyQR')} />
                <Button title="View details" variant="secondary" onPress={() => navigation.navigate('ReservationDetail', { id: active.id })} />
              </View>
            </Card>
          ) : (
            <Card style={styles.main}>
              <View style={styles.mainTop}>
                <View style={styles.row}>
                  <View style={styles.lockIcon}>
                    <Ionicons name="lock-closed-outline" size={22} color={colors.brandText} />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Helmet Storage</Text>
                    <Text style={styles.small}>Available lockers</Text>
                  </View>
                </View>
                <Text style={styles.count}>{data.available_count}</Text>
              </View>
              <Button title="Reserve a Storage" onPress={() => navigation.navigate('Reserve')} disabled={blocked || data.available_count === 0} style={styles.reserveBtn} />
            </Card>
          )}

          {/* No-show warnings */}
          {blocked ? (
            <Notice kind="danger" style={styles.notice}>
              You missed {RULES.noShowLimit} reservations, so reserving is paused until {formatDateTime(user.blocked_until)}.
            </Notice>
          ) : user.no_show_count > 0 ? (
            <Notice kind="warning" style={styles.notice}>
              Missed reservations: {user.no_show_count} of {RULES.noShowLimit}. Reaching {RULES.noShowLimit} pauses reserving for {RULES.blockHours} hours.
            </Notice>
          ) : null}

          {/* Quick actions */}
          <SectionTitle>Quick actions</SectionTitle>
          <View style={styles.grid}>
            {ACTIONS.map((a) => (
              <Pressable key={a.title} onPress={() => navigation.navigate(...a.go)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <View style={styles.actionIcon}>
                  <Ionicons name={a.icon} size={20} color={colors.brandText} />
                </View>
                <Text style={styles.actionTitle}>{a.title}</Text>
                <Text style={styles.small}>{a.text}</Text>
              </Pressable>
            ))}
          </View>

          {/* How it works */}
          <SectionTitle>How it works</SectionTitle>
          <Card>
            {['Reserve a locker in the app.', `At the locker, insert ₱${RULES.fee} and scan your IN QR to store your helmet.`, `After class, insert ₱${RULES.fee} and scan your OUT QR to get it back.`].map((step, i) => (
              <View key={step} style={[styles.step, i > 0 && styles.stepGap]}>
                <Text style={styles.stepNo}>{i + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <Pressable onPress={() => navigation.navigate('Faq')} style={styles.faqLink}>
              <Text style={styles.link}>Full guide and FAQ</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.brandText} />
            </Pressable>
          </Card>
          <View style={styles.bottom} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.text },
  hello: { marginTop: 24, fontSize: 15, color: colors.muted },
  name: { fontSize: 28, fontWeight: '800', color: colors.text },
  main: { marginTop: 20, padding: 18 },
  mainTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lockIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  small: { fontSize: 12, color: colors.muted },
  count: { fontSize: 40, fontWeight: '800', color: colors.text },
  lockerNo: { fontSize: 32, fontWeight: '800', color: colors.text },
  times: { marginTop: 10, fontSize: 15, color: colors.textSoft },
  hint: { marginTop: 6, fontSize: 13, color: colors.muted },
  notice: { marginTop: 12 },
  buttons: { gap: 10, marginTop: 16 },
  reserveBtn: { marginTop: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: { width: '48%', flexGrow: 1, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  pressed: { opacity: 0.75 },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, marginBottom: 10 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  step: { flexDirection: 'row', gap: 12 },
  stepGap: { marginTop: 12 },
  stepNo: { width: 24, height: 24, borderRadius: 12, overflow: 'hidden', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '800', color: colors.text, backgroundColor: colors.surface2 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21, color: colors.muted },
  faqLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 16 },
  link: { fontSize: 14, fontWeight: '600', color: colors.brandText },
  bottom: { height: 16 },
});
