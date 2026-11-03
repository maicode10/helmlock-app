// Text input like the Figma design: grey box, icon on the left, red border + message when wrong
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius } from '../theme';

export default function TextField({ label, icon, error, secureTextEntry, style, ...inputProps }) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);
  const iconColor = error ? colors.textSoft : colors.muted;

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, focused && styles.focused, error && styles.errorBox]}>
        {icon ? <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} /> : null}
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.45)"
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
        />
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={22} color={iconColor} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: font.label,
  box: { flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 14, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', backgroundColor: colors.surface2 },
  focused: { borderColor: 'rgba(255, 255, 255, 0.35)' },
  errorBox: { borderColor: colors.error, backgroundColor: colors.errorFill },
  icon: { marginRight: 12 },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  error: { fontSize: 12, fontWeight: '600', color: colors.error },
});