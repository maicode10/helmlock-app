// Admin master QR: scan it at any locker to open the door with no coins.
// The same text must be in the locker code (ADMIN_QR in helmlock_locker.ino).
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Notice from '../../components/Notice';
import QrCard from '../../components/QrCard';
import { colors } from '../../theme';

// Keep this secret. If it leaks, change it here AND in the locker code.
const ADMIN_QR = 'HLADMIN-3F7E0A22239A6B05E01EF47E';

// The QR hides itself after this many seconds, so it isn't left on screen
const SHOW_SECONDS = 60;

export default function AdminQrScreen() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const showing = secondsLeft > 0;

  useEffect(() => {
    if (!showing) return undefined;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, showing]);

  return (
    <Screen>
      <ScreenHeader title="Admin QR" subtitle="Opens any locker without coins" back />

      <Notice kind="warning" style={styles.gap}>
        Anyone with this QR can open every locker. Don't screenshot it or show it to students.
      </Notice>

      <Card style={styles.card}>
        {showing ? (
          <>
            <QrCard value={ADMIN_QR} label="ADMIN · OPENS ANY LOCKER" />
            <Text style={styles.timer}>Hides in {secondsLeft}s</Text>
            <Button title="Hide QR" variant="secondary" icon="eye-off-outline" onPress={() => setSecondsLeft(0)} style={styles.button} />
          </>
        ) : (
          <>
            <Text style={styles.title}>QR is hidden</Text>
            <Text style={styles.text}>Tap the button, then hold your phone in front of the locker's scanner. The door opens without asking for coins.</Text>
            <Button title="Show Admin QR" icon="qr-code-outline" onPress={() => setSecondsLeft(SHOW_SECONDS)} style={styles.button} />
          </>
        )}
      </Card>

      <Notice kind="info" style={styles.gap}>
        If you take out a student's helmet with this QR, update that locker's status in the Lockers tab too.
      </Notice>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: 16 },
  card: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  text: { marginTop: 8, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center' },
  timer: { marginTop: 12, fontSize: 13, color: colors.faint },
  button: { marginTop: 16, alignSelf: 'stretch' },
});
