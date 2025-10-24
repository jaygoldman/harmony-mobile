import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@harmony/theme';
import { Routes } from '@harmony/navigation';
import { HarmonyScreen } from '../screens/tabs/HarmonyScreen';
import { ActivityScreen } from '../screens/tabs/ActivityScreen';
import { KpiScreen } from '../screens/tabs/KpiScreen';
import { TasksScreen } from '../screens/tabs/TasksScreen';
import { PodcastsScreen } from '../screens/tabs/PodcastsScreen';

type MainTabParamList = {
  [Routes.Harmony]: undefined;
  [Routes.Activity]: undefined;
  [Routes.KPIs]: undefined;
  [Routes.Tasks]: undefined;
  [Routes.Podcasts]: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const { colors, typography } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={Routes.Harmony}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.callout,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamilies.sans.medium,
          fontSize: typography.fontSizes.sm,
        },
      }}
    >
      <Tab.Screen name={Routes.Harmony} component={HarmonyScreen} options={{ title: 'Harmony' }} />
      <Tab.Screen
        name={Routes.Activity}
        component={ActivityScreen}
        options={{ title: 'Activity' }}
      />
      <Tab.Screen name={Routes.KPIs} component={KpiScreen} options={{ title: 'KPIs' }} />
      <Tab.Screen name={Routes.Tasks} component={TasksScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen
        name={Routes.Podcasts}
        component={PodcastsScreen}
        options={{ title: 'Podcasts' }}
      />
    </Tab.Navigator>
  );
};
