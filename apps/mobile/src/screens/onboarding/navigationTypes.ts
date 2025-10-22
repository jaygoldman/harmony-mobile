export type OnboardingStackParamList = {
  Welcome: undefined;
  ManualEntry:
    | {
        code?: string;
        apiUrl?: string;
      }
    | undefined;
  DeveloperTools: undefined;
};
