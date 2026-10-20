// Two steps: 1) enter email or student ID to get a 6-digit code, 2) enter the code and a new password
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import BackButton from '../../components/BackButton';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Flash from '../../components/Flash';
import api from '../../api';
import { USE_FAKE_API } from '../../config';
import { colors, font } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [login, setLogin] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendCode() {
    setErrors({});
    setLoading(true);
    try {
      const res = await api.forgotPassword({ login });
      setMessage(res.message);
      setStep(2);
    } catch (e) {
      setErrors(e.errors || {});
    }
    setLoading(false);
  }

  async function resetPassword() {
    setErrors({});
    setLoading(true);
    try {
      const res = await api.resetPassword({ login, code, password, password_confirmation: confirm });
      navigation.navigate('Login', { notice: res.message });
    } catch (e) {
      setErrors(e.errors || {});
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>{step === 1 ? 'Forgot your password?' : 'Enter your code'}</Text>
      <Text style={styles.subtitle}>
        {step === 1 ? "Enter your email or student ID. We'll email you a 6-digit code." : 'Check your email for the 6-digit code, then choose a new password.'}
      </Text>

      <View style={styles.form}>
        {step === 1 ? (
          <>
            <TextField label="Email or Student ID" icon="mail-outline" placeholder="Email / Student ID" value={login} onChangeText={setLogin} error={errors.login?.[0]} />
            <Button title="Send code" onPress={sendCode} loading={loading} />
          </>
        ) : (
          <>
            <Flash message={message} />
            {USE_FAKE_API ? <Text style={styles.demo}>Demo code: 123456</Text> : null}
            <TextField label="6-digit code" icon="keypad-outline" placeholder="123456" value={code} onChangeText={setCode} error={errors.code?.[0]} keyboardType="number-pad" maxLength={6} />
            <TextField label="New Password" icon="lock-closed-outline" placeholder="At least 8 characters" value={password} onChangeText={setPassword} error={errors.password?.[0]} secureTextEntry />
            <TextField label="Confirm New Password" icon="lock-closed-outline" placeholder="Type it again" value={confirm} onChangeText={setConfirm} error={errors.password_confirmation?.[0]} secureTextEntry />
            <Button title="Save new password" onPress={resetPassword} loading={loading} />
            <Button title="Send a new code" variant="ghost" onPress={() => setStep(1)} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...font.title, marginTop: 24 },
  subtitle: { ...font.body, marginTop: 4, color: colors.muted },
  form: { gap: 16, marginTop: 24 },
  demo: { fontSize: 12, color: colors.faint },
});
