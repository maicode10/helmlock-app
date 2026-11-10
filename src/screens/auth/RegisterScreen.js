import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import BackButton from '../../components/BackButton';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';
import { useAuth } from '../../context/AuthContext';
import { colors, font } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', mobile: '', email: '', password: '', password_confirmation: '', terms: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (value) => setForm({ ...form, [key]: value });

  async function submit() {
    setErrors({});
    setLoading(true);
    try {
      await signUp(form);
    } catch (e) {
      setErrors(e.errors && Object.keys(e.errors).length ? e.errors : { name: [e.message] });
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>For USTP-CDO students who ride to campus. One account per person.</Text>

      <View style={styles.form}>
        <TextField label="Full Name" icon="person-outline" placeholder="Ex. Juan Dela Cruz" value={form.name} onChangeText={set('name')} error={errors.name?.[0]} autoCapitalize="words" autoComplete="name" />
        <TextField label="Mobile Number" icon="call-outline" placeholder="Ex. 09171234567" value={form.mobile} onChangeText={set('mobile')} error={errors.mobile?.[0]} keyboardType="phone-pad" autoComplete="tel" maxLength={13} />
        <TextField label="Email" icon="mail-outline" placeholder="Ex. juan.dela.cruz@gmail.com" value={form.email} onChangeText={set('email')} error={errors.email?.[0]} keyboardType="email-address" autoComplete="email" />
        <TextField label="Password" icon="lock-closed-outline" placeholder="At least 8 characters" value={form.password} onChangeText={set('password')} error={errors.password?.[0]} secureTextEntry autoComplete="new-password" />
        <TextField label="Confirm Password" icon="lock-closed-outline" placeholder="Type your password again" value={form.password_confirmation} onChangeText={set('password_confirmation')} error={errors.password_confirmation?.[0]} secureTextEntry autoComplete="new-password" />

        <View>
          <Checkbox checked={form.terms} onChange={set('terms')}>
            <Text style={styles.terms}>
              I agree to the{' '}
              <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>
                Terms and Rules
              </Text>
              .
            </Text>
          </Checkbox>
          {errors.terms ? <Text style={styles.error}>{errors.terms[0]}</Text> : null}
        </View>

        <Button title="Create Account" onPress={submit} loading={loading} />
      </View>

      <Text style={styles.switch}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.replace('Login')}>
          Log In
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...font.title, marginTop: 12 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4, color: colors.textSoft },
  form: { gap: 16, marginTop: 24 },
  terms: { fontSize: 14, color: colors.textSoft, lineHeight: 20 },
  link: { fontWeight: '700', color: colors.brandBright },
  error: { marginTop: 6, fontSize: 12, fontWeight: '600', color: colors.error },
  switch: { marginTop: 20, marginBottom: 8, textAlign: 'center', fontSize: 14, color: colors.textSoft },
});