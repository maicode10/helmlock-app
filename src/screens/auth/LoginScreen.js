import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import BackButton from '../../components/BackButton';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import Flash from '../../components/Flash';
import { useAuth } from '../../context/AuthContext';
import { USE_FAKE_API } from '../../config';
import { colors, font, radius } from '../../theme';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const notice = route.params?.notice; // message from Forgot Password

  async function submit() {
    setErrors({});
    setLoading(true);
    try {
      await signIn(login, password);
      // No navigate needed: the app switches to the logged-in screens by itself
    } catch (e) {
      setErrors(e.errors && Object.keys(e.errors).length ? e.errors : { login: [e.message] });
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to reserve a locker for your helmet.</Text>

      <View style={styles.form}>
        <Flash message={notice} />
        <TextField label="Email or Student ID" icon="mail-outline" placeholder="Email / Student ID" value={login} onChangeText={setLogin} error={errors.login?.[0]} autoComplete="username" />
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

      {USE_FAKE_API ? (
        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Demo accounts (fake backend)</Text>
          <Text style={styles.demoText}>Student: 2023123456 / password</Text>
          <Text style={styles.demoText}>Admin: admin@helmlock.test / password</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...font.title, marginTop: 24 },
  subtitle: { ...font.body, marginTop: 4, color: colors.muted },
  form: { gap: 16, marginTop: 24 },
  forgot: { alignSelf: 'flex-end', marginTop: -4, fontSize: 13, fontWeight: '600', color: colors.brandBright },
  switch: { marginTop: 24, textAlign: 'center', fontSize: 14, color: colors.muted },
  link: { fontWeight: '700', color: colors.brandBright },
  demo: { marginTop: 24, padding: 12, borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line },
  demoTitle: { fontSize: 12, fontWeight: '700', color: colors.muted, marginBottom: 4 },
  demoText: { fontSize: 12, color: colors.faint },
});
