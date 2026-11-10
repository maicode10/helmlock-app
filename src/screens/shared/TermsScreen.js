import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import ScreenHeader from '../../components/ScreenHeader';
import Card from '../../components/Card';
import { RULES } from '../../config';
import { colors, font } from '../../theme';

const SECTIONS = [
  ['1. Who can use HelmLock', [
    'HelmLock is for USTP-CDO students who ride a motorcycle to campus.',
    'Each student may have only one account, registered with their real name, email, and mobile number.',
  ]],
  ['2. Reservations', [
    'You may have only one active reservation at a time.',
    `Store your helmet within ${RULES.arriveWindowMinutes} minutes of your drop-off time, or the reservation expires.`,
    `Missing ${RULES.noShowLimit} reservations pauses reserving for ${RULES.blockHours} hours.`,
    `The longest storage time is ${RULES.maxStorageHours} hours.`,
  ]],
  ['3. Fees and coins', [
    `Storing (IN) costs ₱${RULES.dropOffFee}. Retrieving (OUT) costs ₱${RULES.hourlyFee} for every hour reserved. Both are paid by coin at the locker.`,
    `If you retrieve late, the first ${RULES.lateGraceMinutes} minutes are free. After that, a late fee of ₱${RULES.lateFeePerHour} applies for every late hour.`,
    'If a QR scan fails after you insert a coin, your coin credit stays active for a short time so you can scan again.',
    'Coins are not refunded automatically. If the locker fails after you paid, send a Report a Problem and the HelmLock team will check it.',
  ]],
  ['4. Your QR codes', [
    'Your IN and OUT QR codes work only once and only for your locker.',
    "Don't share your QR codes. Anyone with your OUT QR could open your locker.",
    'If you lose your OUT QR, make a new one in the app. The old one stops working right away.',
  ]],
  ['5. What you can store', [
    'HelmLock lockers are for helmets only. Do not store money, gadgets, or other valuables.',
    'Make sure your helmet fits inside the locker before closing the door.',
  ]],
  ['6. Responsibility', [
    'The HelmLock team takes care to keep the lockers secure, but is not responsible for loss, theft, or damage to items stored in the lockers.',
    'If a locker breaks or the power goes out, report it. The team will open the locker with the manual key.',
    'Helmets left past the maximum storage time may be removed by the team and kept safe until claimed.',
  ]],
  ['7. Your data', [
    'We collect only your name, email, mobile number, and your reservation history.',
    'This data is used only to run HelmLock, and is not shared with anyone outside the HelmLock team.',
    'We follow the Data Privacy Act of 2012 (Republic Act No. 10173). You can ask the team to correct or delete your data.',
  ]],
  ['8. Misuse', [
    'Accounts that use fake details, damage the lockers, or try to open other lockers may be blocked.',
  ]],
];

export default function TermsScreen() {
  return (
    <Screen>
      <ScreenHeader back title="Terms and Rules" subtitle="By creating an account, you agree to these rules." />

      <View style={styles.list}>
        {SECTIONS.map(([heading, rules]) => (
          <Card key={heading}>
            <Text style={styles.heading}>{heading}</Text>
            {rules.map((rule) => (
              <View key={rule} style={styles.rule}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 16 },
  heading: { ...font.h2, fontSize: 16, marginBottom: 8 },
  rule: { flexDirection: 'row', gap: 8, marginTop: 4 },
  bullet: { color: colors.brandBright, fontSize: 14, lineHeight: 20 },
  ruleText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.textSoft },
});