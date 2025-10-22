export type OnboardingStackParamList = {
  Welcome: undefined;
  Scan: undefined;
  ManualEntry:
    | {
        code?: string;
        apiUrl?: string;
      }
    | undefined;
  DeveloperTools: undefined;
};
