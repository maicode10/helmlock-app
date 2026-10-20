// Title row at the top of a screen, with optional back arrow and right-side button
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

export default function ScreenHeader({ title, subtitle, back = false, right, onRightPress, rightLabel }) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {back ? (
          <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={colors.muted} />
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {right ? (
          <Pressable onPress={onRightPress} style={styles.right} hitSlop={8} accessibilityLabel={rightLabel || title}>
            <Ionicons name={right} size={22} color={colors.textSoft} />
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 40 },
  back: { width: 40, height: 40, marginLeft: -8, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 24, fontWeight: '800', color: colors.text },
  right: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  subtitle: { marginTop: 2, fontSize: 14, lineHeight: 20, color: colors.muted },
});
