// ========================================
// THE RIDES CLUB — Tab Layout
// 4 tabs: Map, Rides, Clubs, Profile
// ========================================

import { Tabs } from 'expo-router';
import { Text, StyleSheet, useColorScheme, View } from 'react-native';
import { Themes, Typography, Spacing } from '../../constants/Theme';

function TabIcon({ emoji, label, focused, color }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: 0.5,
          height: 85,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...Typography.tabLabel,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: theme.headerBg,
        },
        headerTitleStyle: {
          ...Typography.heading,
          color: theme.text,
        },
        headerShadowVisible: false,
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          headerTitle: 'Discover',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🗺️" label="Map" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: 'Rides',
          headerTitle: 'Rides',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏍️" label="Rides" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'Clubs',
          headerTitle: 'Clubs',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👥" label="Clubs" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="Profile" focused={focused} color={color} />
          ),
        }}
      />

      {/* Hide boilerplate screens that may still exist in the directory */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabEmoji: {
    fontSize: 22,
  },
});
