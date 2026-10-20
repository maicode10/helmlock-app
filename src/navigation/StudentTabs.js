// Bottom menu for students: Home, Reserve, My QR, History
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/student/HomeScreen';
import ReserveScreen from '../screens/student/ReserveScreen';
import MyQrScreen from '../screens/student/MyQrScreen';
import HistoryScreen from '../screens/student/HistoryScreen';
import { tabOptions } from './tabOptions';

const Tab = createBottomTabNavigator();

const ICONS = { Home: 'home', Reserve: 'calendar', MyQR: 'qr-code', History: 'time' };

export default function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={tabOptions(ICONS)}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Reserve" component={ReserveScreen} />
      <Tab.Screen name="MyQR" component={MyQrScreen} options={{ title: 'My QR' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
}
