import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerStyle: {
          backgroundColor: "#18192b",
          borderBottomWidth: 2, // Add border bottom width
          borderBottomColor: '#CCCCCC', // Add border bottom color (light grey)
        },
        headerTintColor: "#fff",
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Fire Monitoring',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'pulse' : 'pulse-outline'} color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}
