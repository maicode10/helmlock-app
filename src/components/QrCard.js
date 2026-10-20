// Big QR code on a white card so the scanner can read it easily
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, radius } from '../theme';

export default function QrCard({ value, label, used }) {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 120, 260);

  return (
    <View style={styles.wrap}>
      <View style={[styles.white, used && styles.used]}>
        <QRCode value={value || 'helmlock'} size={size} backgroundColor="#ffffff" color="#0f0f10" />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  white: { padding: 16, borderRadius: radius.lg, backgroundColor: '#ffffff' },
  used: { opacity: 0.25 },
  label: { marginTop: 12, fontSize: 12, letterSpacing: 1.5, fontWeight: '700', color: colors.muted },
});
