// Bottom menu for admins: Overview, Lockers, Reservations, Students, More
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminOverviewScreen from '../screens/admin/AdminOverviewScreen';
import AdminLockersScreen from '../screens/admin/AdminLockersScreen';
import AdminReservationsScreen from '../screens/admin/AdminReservationsScreen';
import AdminStudentsScreen from '../screens/admin/AdminStudentsScreen';
import AdminMoreScreen from '../screens/admin/AdminMoreScreen';
import { tabOptions } from './tabOptions';

const Tab = createBottomTabNavigator();

const ICONS = { Overview: 'grid', Lockers: 'lock-closed', Reservations: 'list', Students: 'people', More: 'menu' };

export default function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions(ICONS)}>
      <Tab.Screen name="Overview" component={AdminOverviewScreen} />
      <Tab.Screen name="Lockers" component={AdminLockersScreen} />
      <Tab.Screen name="Reservations" component={AdminReservationsScreen} options={{ title: 'Bookings' }} />
      <Tab.Screen name="Students" component={AdminStudentsScreen} />
      <Tab.Screen name="More" component={AdminMoreScreen} />
    </Tab.Navigator>
  );
}
