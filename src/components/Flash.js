// Green success or red error message box
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function Flash({ type = 'success', message }) {
  if (!message) return null;
  const isError = type === 'error';

  return (
    <View style={[styles.box, isError ? styles.error : styles.success]}>
      <Ionicons name={isError ? 'alert-circle' : 'checkmark-circle'} size={18} color={isError ? colors.brandText : colors.green} />
      <Text style={[styles.text, { color: isError ? '#fca5a5' : '#6ee7b7' }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: radius.md, borderWidth: 1 },
  success: { backgroundColor: colors.greenSoft, borderColor: 'rgba(16, 185, 129, 0.3)' },
  error: { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder },
  text: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
});
