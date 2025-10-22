import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ManualEntryScreen } from '../screens/onboarding/ManualEntryScreen';
import { DeveloperToolsScreen } from '../screens/onboarding/DeveloperToolsScreen';
import type { OnboardingStackParamList } from '../screens/onboarding/navigationTypes';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
    <Stack.Screen name="DeveloperTools" component={DeveloperToolsScreen} />
  </Stack.Navigator>
);
