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
  const [form, setForm] = useState({ name: '', student_id: '', email: '', password: '', password_confirmation: '', terms: false });
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
      <Text style={styles.subtitle}>Use your USTP-CDO student ID. One account per student.</Text>

      <View style={styles.form}>
        <TextField label="Full Name" icon="person-outline" placeholder="Enter your full name" value={form.name} onChangeText={set('name')} error={errors.name?.[0]} autoCapitalize="words" autoComplete="name" />
        <TextField label="Student ID" icon="card-outline" placeholder="Enter your student ID" value={form.student_id} onChangeText={set('student_id')} error={errors.student_id?.[0]} keyboardType="number-pad" />
        <TextField label="Email" icon="mail-outline" placeholder="Enter your email" value={form.email} onChangeText={set('email')} error={errors.email?.[0]} keyboardType="email-address" autoComplete="email" />
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
  title: { ...font.title, marginTop: 16 },
  subtitle: { ...font.body, marginTop: 4, color: colors.muted },
  form: { gap: 16, marginTop: 24 },
  terms: { fontSize: 14, color: colors.muted, lineHeight: 20 },
  link: { fontWeight: '700', color: colors.brandBright },
  error: { marginTop: 6, fontSize: 12, fontWeight: '500', color: colors.brandText },
  switch: { marginTop: 24, marginBottom: 8, textAlign: 'center', fontSize: 14, color: colors.muted },
});
