import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import BackButton from '../../components/BackButton';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Flash from '../../components/Flash';
import { useAuth } from '../../context/AuthContext';
import { colors, font } from '../../theme';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const notice = route.params?.notice; // message from Forgot Password

  async function submit() {
    setErrors({});
    setLoading(true);
    try {
      await signIn(email, password);
      // No navigate needed: the app switches to the logged-in screens by itself
    } catch (e) {
      setErrors(e.errors && Object.keys(e.errors).length ? e.errors : { email: [e.message] });
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Log in to reserve a locker for your helmet.</Text>

      <View style={styles.form}>
        <Flash message={notice} />
        <TextField label="Email" icon="mail-outline" placeholder="Ex. juan.dela.cruz@gmail.com" value={email} onChangeText={setEmail} error={errors.email?.[0]} keyboardType="email-address" autoComplete="email" />
        <TextField label="Password" icon="lock-closed-outline" placeholder="Enter your password" value={password} onChangeText={setPassword} error={errors.password?.[0]} secureTextEntry autoComplete="password" onSubmitEditing={submit} />

        <Text style={styles.forgot} onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot password?
        </Text>

        <Button title="Log In" onPress={submit} loading={loading} />
      </View>

      <Text style={styles.switch}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.replace('Register')}>
          Sign Up
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...font.title, marginTop: 12 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4, color: colors.textSoft },
  form: { gap: 16, marginTop: 24 },
  forgot: { alignSelf: 'flex-end', marginTop: -4, fontSize: 13, fontWeight: '600', color: colors.brandBright },
  switch: { marginTop: 20, textAlign: 'center', fontSize: 14, color: colors.textSoft },
  link: { fontWeight: '700', color: colors.brandBright },
});