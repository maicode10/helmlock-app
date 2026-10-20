// Small heading above a group of items
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function SectionTitle({ children, right }) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{children}</Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 },
  text: { fontSize: 13, fontWeight: '700', letterSpacing: 0.4, color: colors.muted, textTransform: 'uppercase' },
});
