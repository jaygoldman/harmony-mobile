/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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

  type RouteName<ParamList extends ParamListBase> = Extract<keyof ParamList, string>;

  type ScreenOptionsContext<ParamList extends ParamListBase> = {
    route: {
      key: string;
      name: RouteName<ParamList>;
      params: ParamList[RouteName<ParamList>];
    };
    navigation: {
      navigate: (name: RouteName<ParamList>, params?: ParamList[RouteName<ParamList>]) => void;
      goBack: () => void;
    };
  };

  export type BottomTabNavigatorProps<ParamList extends ParamListBase> = {
    initialRouteName?: RouteName<ParamList>;
    screenOptions?:
      | BottomTabNavigationOptions
      | ((context: ScreenOptionsContext<ParamList>) => BottomTabNavigationOptions);
    children: React.ReactNode;
  };

  export type BottomTabScreenProps<ParamList extends ParamListBase> = {
    name: RouteName<ParamList>;
    component: React.ComponentType<object>;
    options?: BottomTabNavigationOptions;
  };

  export type BottomTabGroupProps = {
    children: React.ReactNode;
    screenOptions?: BottomTabNavigationOptions;
  };

  export function createBottomTabNavigator<ParamList extends ParamListBase>(): {
    Navigator: React.ComponentType<BottomTabNavigatorProps<ParamList>>;
    Screen: React.ComponentType<BottomTabScreenProps<ParamList>>;
    Group: React.ComponentType<BottomTabGroupProps>;
  };
}
