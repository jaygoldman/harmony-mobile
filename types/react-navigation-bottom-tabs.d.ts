declare module '@react-navigation/bottom-tabs' {
  import * as React from 'react';
  import type { ParamListBase } from '@react-navigation/native';

  export interface BottomTabNavigationOptions {
    title?: string;
    tabBarLabel?: string;
    tabBarIcon?: (props: { color: string; focused: boolean; size: number }) => React.ReactNode;
    tabBarBadge?: string | number;
    tabBarActiveTintColor?: string;
    tabBarInactiveTintColor?: string;
    tabBarStyle?: Record<string, unknown>;
    tabBarLabelStyle?: Record<string, unknown>;
    headerShown?: boolean;
  }

  export type BottomTabNavigator = React.ComponentType<{
    initialRouteName?: string;
    screenOptions?: BottomTabNavigationOptions | ((props: any) => BottomTabNavigationOptions);
    children: React.ReactNode;
  }>;

  export type BottomTabScreen = React.ComponentType<{
    name: keyof ParamListBase | string;
    component: React.ComponentType<any>;
    options?: BottomTabNavigationOptions;
  }>;

  export function createBottomTabNavigator<ParamList extends ParamListBase>(): {
    Navigator: BottomTabNavigator;
    Screen: BottomTabScreen;
    Group: React.ComponentType<any>;
  };
}
