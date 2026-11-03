// Get Started screen (Figma: "Get Started"). Plain black background with the HelmLock logo.
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import { colors } from '../../theme';

const STEPS = [
  { icon: 'calendar-outline', text: 'RESERVE' },
  { icon: 'cash-outline', text: 'INSERT COIN' },
  { icon: 'qr-code-outline', text: 'SCAN QR' },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <Screen background="plain" edges={['top', 'bottom', 'left', 'right']} style={styles.page}>
      <View style={styles.hero}>
        <Logo width={250} />
        <Text style={styles.tagline}>Your shield on the road, our priority in storage.</Text>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step.text} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={20} color="#1a1a1a" />
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
  page: { paddingHorizontal: 28 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  tagline: { marginTop: 22, maxWidth: 260, textAlign: 'center', fontSize: 17, fontWeight: '700', lineHeight: 23, color: colors.text },
  steps: { flexDirection: 'row', gap: 12, marginTop: 40, alignSelf: 'stretch' },
  step: { flex: 1, alignItems: 'center', paddingTop: 14, paddingBottom: 12, borderRadius: 16, backgroundColor: colors.stepCard },
  stepIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  stepNo: { marginTop: 8, fontSize: 10, color: 'rgba(255, 255, 255, 0.6)' },
  stepText: { marginTop: 2, fontSize: 11, fontWeight: '800', color: colors.text, textAlign: 'center' },
  actions: { gap: 12, paddingBottom: 8 },
  footer: { marginTop: 4, textAlign: 'center', fontSize: 12, color: colors.faint },
  link: { textDecorationLine: 'underline', color: colors.muted },
});