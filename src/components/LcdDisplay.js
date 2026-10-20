// Looks like the locker's 16x2 LCD screen
import { Platform, StyleSheet, Text, View } from 'react-native';
import { radius } from '../theme';

export default function LcdDisplay({ lines = ['', ''] }) {
  return (
    <View style={styles.frame}>
      <View style={styles.screen}>
        {lines.slice(0, 2).map((line, i) => (
          <Text key={i} style={styles.text}>
            {(line || '').toUpperCase().padEnd(16, ' ').slice(0, 16)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const mono = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const styles = StyleSheet.create({
  frame: { alignSelf: 'center', padding: 8, borderRadius: radius.md, backgroundColor: '#0b0b0c', borderWidth: 1, borderColor: '#2a2a2e' },
  screen: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6, backgroundColor: '#3b5d1f' },
  text: { fontFamily: mono, fontSize: 17, letterSpacing: 1, color: '#d7f3b2', lineHeight: 24 },
});
