// Page wrapper: red-to-black background, safe from the notch, scrolls, and moves up for the keyboard.
// background="plain" gives a solid black page (Welcome screen).
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Backdrop from './Backdrop';
import { colors } from '../theme';

export default function Screen({ children, scroll = true, padded = true, edges = ['top', 'left', 'right'], style, refreshControl, background = 'gradient' }) {
  const inner = [padded && styles.padded, style];

  return (
    <View style={styles.root}>
      <Backdrop variant={background} />
      <SafeAreaView style={styles.flex} edges={edges}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {scroll ? (
            <ScrollView contentContainerStyle={[styles.grow, inner]} keyboardShouldPersistTaps="handled" refreshControl={refreshControl}>
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.flex, inner]}>{children}</View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  flex: { flex: 1 },
  grow: { flexGrow: 1 },
  padded: { paddingHorizontal: 20, paddingVertical: 16 },
});