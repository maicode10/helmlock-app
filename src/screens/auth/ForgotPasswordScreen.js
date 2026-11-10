// Two steps: 1) enter your email to get a 6-digit code, 2) enter the code and a new password
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import BackButton from '../../components/BackButton';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Flash from '../../components/Flash';
import api from '../../api';
import { colors, font } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
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
      const res = await api.forgotPassword({ email });
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
      const res = await api.resetPassword({ email, code, password, password_confirmation: confirm });
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
        {step === 1 ? "Enter your email. We'll send you a 6-digit code." : 'Check your email for the 6-digit code, then choose a new password.'}
      </Text>

      <View style={styles.form}>
        {step === 1 ? (
          <>
            <TextField label="Email" icon="mail-outline" placeholder="Ex. juan.dela.cruz@gmail.com" value={email} onChangeText={setEmail} error={errors.email?.[0]} keyboardType="email-address" />
            <Button title="Send code" onPress={sendCode} loading={loading} />
          </>
        ) : (
          <>
            <Flash message={message} />
            <TextField label="6-digit code" icon="keypad-outline" placeholder="Enter the code" value={code} onChangeText={setCode} error={errors.code?.[0]} keyboardType="number-pad" maxLength={6} />
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
  title: { ...font.title, marginTop: 12 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4, color: colors.textSoft },
  form: { gap: 16, marginTop: 24 },
});