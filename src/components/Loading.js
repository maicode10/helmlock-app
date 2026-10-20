// Centered spinner, or an error with a "Try again" button
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors } from '../theme';

export default function Loading({ error, onRetry }) {
  return (
    <View style={styles.center}>
      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} style={styles.button} /> : null}
        </>
      ) : (
        <ActivityIndicator size="large" color={colors.brandBright} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  button: { marginTop: 16, alignSelf: 'stretch' },
});
