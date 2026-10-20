// Friendly message when a list is empty
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors } from '../theme';

export default function EmptyState({ icon = 'file-tray-outline', title, text, actionTitle, onAction }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={28} color={colors.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      {actionTitle ? <Button title={actionTitle} onPress={onAction} style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  title: { marginTop: 16, fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center' },
  text: { marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.muted, textAlign: 'center', maxWidth: 300 },
  button: { marginTop: 20, alignSelf: 'stretch' },
});
