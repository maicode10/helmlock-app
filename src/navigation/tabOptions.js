// Shared look for the bottom menus
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export function tabOptions(icons) {
  return ({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.text,
    tabBarInactiveTintColor: colors.faint,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons name={focused ? icons[route.name] : icons[route.name] + '-outline'} size={size} color={focused ? colors.brandBright : color} />
    ),
  });
}
