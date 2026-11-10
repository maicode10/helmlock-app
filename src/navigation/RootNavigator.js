// Decides which screens to show: logged out, student, or admin
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { colors } from '../theme';

// Logged out
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Everyone
import TermsScreen from '../screens/shared/TermsScreen';
import FaqScreen from '../screens/shared/FaqScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Students
import StudentTabs from './StudentTabs';
import ReservationDetailScreen from '../screens/student/ReservationDetailScreen';
import ReportScreen from '../screens/student/ReportScreen';

// Admins
import AdminTabs from './AdminTabs';
import AdminLockerFormScreen from '../screens/admin/AdminLockerFormScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminTeamScreen from '../screens/admin/AdminTeamScreen';
import AdminExportScreen from '../screens/admin/AdminExportScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, booting } = useAuth();

  // While checking for a saved login
  if (booting) {
    return (
      <View style={styles.splash}>
        <Logo />
        <ActivityIndicator color={colors.brandBright} style={styles.spinner} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink }, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Faq" component={FaqScreen} />
        </>
      ) : user.role === 'admin' ? (
        <>
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="AdminLockerForm" component={AdminLockerFormScreen} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
          <Stack.Screen name="AdminTeam" component={AdminTeamScreen} />
          <Stack.Screen name="AdminExport" component={AdminExportScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Faq" component={FaqScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="StudentTabs" component={StudentTabs} />
          <Stack.Screen name="ReservationDetail" component={ReservationDetailScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Faq" component={FaqScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink },
  spinner: { marginTop: 24 },
});