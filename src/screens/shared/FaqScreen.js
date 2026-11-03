import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import SectionTitle from '../../components/SectionTitle';
import { RULES } from '../../config';
import { colors, radius } from '../../theme';

const STEPS = [
  ['person-add-outline', 'Create an account', 'Sign up with your name, USTP-CDO student ID, and email. One account per student.'],
  ['calendar-outline', 'Reserve a locker', `Pick a free locker, your drop-off time, and how many hours you need it. You can reserve up to ${RULES.maxAdvanceMinutes} minutes ahead.`],
  ['qr-code-outline', 'Open your IN QR', 'Go to My QR. Turn your screen brightness up so the scanner reads it easily.'],
  ['cash-outline', 'Store your helmet', `At your locker, insert ₱${RULES.dropOffFee} and scan your IN QR. The door opens. Put your helmet inside and close the door. Do this within ${RULES.arriveWindowMinutes} minutes of your drop-off time.`],
  ['lock-open-outline', 'Get your helmet back', `After class, open your OUT QR. Insert ₱${RULES.hourlyFee} for every hour you reserved (the app shows the exact amount) and scan it. Take your helmet and close the door.`],
];

const FAQS = [
  ['How much does it cost?', `₱${RULES.dropOffFee} when you store your helmet, then ₱${RULES.hourlyFee} for every hour you reserved when you get it back. For example, 3 hours costs ₱${RULES.dropOffFee} + ₱${3 * RULES.hourlyFee} = ₱${RULES.dropOffFee + 3 * RULES.hourlyFee}.`],
  ["What if I'm late getting my helmet?", `The first ${RULES.lateGraceMinutes} minutes late are free. After that, ₱${RULES.lateFeePerHour} is added for every late hour. The locker screen and the app show the total to insert before you scan your OUT QR.`],
  ["What if I don't show up?", `If you don't store your helmet within ${RULES.arriveWindowMinutes} minutes of your drop-off time, the reservation expires and counts as missed. After ${RULES.noShowLimit} missed reservations, you can't reserve for ${RULES.blockHours} hours.`],
  ['Can I cancel a reservation?', "Yes, as long as you haven't stored your helmet yet. Open your reservation and tap Cancel. Cancelling doesn't count as missed."],
  ['Can I reserve more than one locker?', 'No. You can have one active reservation at a time, so more students get a locker.'],
  ['How long can I keep my helmet inside?', `Up to ${RULES.maxStorageHours} hours per reservation.`],
  ['I lost my OUT QR or my phone. What do I do?', 'Log in on any phone and open My QR. You can make a new OUT QR there, and the old one stops working right away.'],
  ["The QR won't scan.", 'Turn your brightness up, hold your phone steady about a hand away from the scanner, and show the whole code. If the screen says "Wrong locker", go to the locker number shown in the app.'],
  ["The locker won't open, or I paid and nothing happened.", 'Send a Report a Problem with your locker number. The HelmLock team will check it and can open the locker with the manual key. Coins are not refunded automatically.'],
  ['What if there is a power outage?', 'Your helmet stays locked inside. Send a Report a Problem, and the team will open the locker with the manual key.'],
  ['Can I store other things?', 'No. HelmLock lockers are for helmets only. Do not leave money, gadgets, or valuables inside.'],
  ['I forgot my password.', 'On the login screen, tap Forgot password? and enter your email or student ID. We will email you a 6-digit code.'],
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen(!open)} style={styles.faq} accessibilityRole="button" accessibilityState={{ expanded: open }}>
      <View style={styles.faqRow}>
        <Text style={styles.question}>{question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.faint} />
      </View>
      {open ? <Text style={styles.answer}>{answer}</Text> : null}
    </Pressable>
  );
}

export default function FaqScreen() {
  return (
    <Screen>
      <ScreenHeader back title="Help & FAQ" subtitle="How to use HelmLock, and answers to common questions." />

      <SectionTitle>How to use HelmLock</SectionTitle>
      <View style={styles.list}>
        {STEPS.map(([icon, title, text], i) => (
          <View key={title} style={styles.step}>
            <View style={styles.stepIcon}>
              <Ionicons name={icon} size={18} color={colors.brandText} />
              <Text style={styles.stepNo}>{i + 1}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.stepTitle}>{title}</Text>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          </View>
        ))}
      </View>

      <SectionTitle>Frequently asked questions</SectionTitle>
      <View style={styles.list}>
        {FAQS.map(([q, a]) => (
          <FaqItem key={q} question={q} answer={a} />
        ))}
      </View>
      <View style={styles.bottom} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  step: { flexDirection: 'row', gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  stepIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2 },
  stepNo: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, overflow: 'hidden', textAlign: 'center', lineHeight: 18, fontSize: 10, fontWeight: '800', color: colors.text, backgroundColor: colors.brand },
  flex: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  stepText: { marginTop: 3, fontSize: 13, lineHeight: 19, color: colors.muted },
  faq: { padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  question: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
  answer: { marginTop: 10, fontSize: 14, lineHeight: 21, color: colors.muted },
  bottom: { height: 24 },
});