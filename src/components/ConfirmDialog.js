// "Are you sure?" popup in HelmLock style
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors, radius } from '../theme';

export default function ConfirmDialog({ visible, title, message, confirmText = 'Confirm', cancelText = 'Go back', onConfirm, onCancel, loading }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.box} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button title={cancelText} variant="secondary" onPress={onCancel} style={styles.flex} />
            <Button title={confirmText} onPress={onConfirm} loading={loading} style={styles.flex} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { width: '100%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.line, padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  message: { marginTop: 8, fontSize: 14, lineHeight: 20, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  flex: { flex: 1 },
});
