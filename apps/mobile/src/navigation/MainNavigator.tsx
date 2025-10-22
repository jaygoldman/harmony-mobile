import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@harmony/theme';
import { Routes } from '@harmony/navigation';
import { PlaceholderTabScreen } from '../screens/tabs/PlaceholderTabScreen';

type MainTabParamList = {
  [Routes.Harmony]: undefined;
  [Routes.Activity]: undefined;
  [Routes.KPIs]: undefined;
  [Routes.Tasks]: undefined;
  [Routes.Podcasts]: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const HarmonyTab = () => (
  <PlaceholderTabScreen
    title="Harmony"
    description="Chat with Harmony and other agents. Message history, mentions, and voice mode land here."
  />
);

const ActivityTab = () => (
  <PlaceholderTabScreen
    title="Activity"
    description="Stay on top of Conductor updates, DealCloud deals, Jira tickets, and more via the unified feed."
  />
);

const KpiTab = () => (
  <PlaceholderTabScreen
    title="KPIs"
    description="KPIs sync from Conductor—pin tiles, view hierarchy drill-downs, and prepare for widgets."
  />
);

const TasksTab = () => (
  <PlaceholderTabScreen
    title="Tasks"
    description="Manage personal and shared tasks with grouped lists, swipe actions, and reminders."
  />
);

const PodcastsTab = () => (
  <PlaceholderTabScreen
    title="Podcasts"
    description="Listen to weekly leadership briefings with offline playback and notifications."
  />
);

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
      <Tab.Screen name={Routes.Harmony} component={HarmonyTab} options={{ title: 'Harmony' }} />
      <Tab.Screen name={Routes.Activity} component={ActivityTab} options={{ title: 'Activity' }} />
      <Tab.Screen name={Routes.KPIs} component={KpiTab} options={{ title: 'KPIs' }} />
      <Tab.Screen name={Routes.Tasks} component={TasksTab} options={{ title: 'Tasks' }} />
      <Tab.Screen name={Routes.Podcasts} component={PodcastsTab} options={{ title: 'Podcasts' }} />
    </Tab.Navigator>
  );
};
