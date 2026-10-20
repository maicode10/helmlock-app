import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { colors, radius } from '../../theme';

const STEPS = [
  { icon: 'calendar-outline', text: 'Reserve' },
  { icon: 'cash-outline', text: 'Insert coin' },
  { icon: 'qr-code-outline', text: 'Scan QR' },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      {/* Soft red glow behind the logo */}
      <View pointerEvents="none" style={styles.glowWrap}>
        <View style={[styles.glow, { width: 560, height: 560, opacity: 0.04 }]} />
        <View style={[styles.glow, { width: 420, height: 420, opacity: 0.05 }]} />
        <View style={[styles.glow, { width: 280, height: 280, opacity: 0.06 }]} />
      </View>

      <View style={styles.hero}>
        <Logo />
        <Text style={styles.tagline}>Your shield on the road, our priority in storage.</Text>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step.text} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={20} color={colors.brandBright} />
              </View>
              <Text style={styles.stepNo}>Step {i + 1}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Sign Up" onPress={() => navigation.navigate('Register')} />
        <Button title="Log In" variant="secondary" onPress={() => navigation.navigate('Login')} />
        <Text style={styles.footer}>
          For USTP-CDO students only ·{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Faq')}>
            Help
          </Text>
          {' · '}
          <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>
            Terms
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glowWrap: { position: 'absolute', top: -120, left: 0, right: 0, height: 560, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', borderRadius: 999, backgroundColor: colors.brand },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  tagline: { marginTop: 32, maxWidth: 280, textAlign: 'center', fontSize: 18, fontWeight: '600', lineHeight: 25, color: colors.text },
  steps: { flexDirection: 'row', gap: 10, marginTop: 28, alignSelf: 'stretch' },
  step: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  stepIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandSoft },
  stepNo: { marginTop: 8, fontSize: 11, color: colors.faint },
  stepText: { fontSize: 12, fontWeight: '700', color: colors.text },
  actions: { gap: 12, paddingBottom: 8 },
  footer: { marginTop: 4, textAlign: 'center', fontSize: 12, color: colors.faint },
  link: { textDecorationLine: 'underline', color: colors.muted },
});
