import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StackNames } from '../constants/StackNames';
import { useAuth } from '../context/AuthContext';
import { navigationRef, reset } from '../helper/NavigationService';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasCompletedOnboarding, hasSkippedLogin } = useAuth();

  useEffect(() => {
    if (isLoading || !navigationRef.isReady()) return;

    const currentRoute = navigationRef.getCurrentRoute()?.name;
    console.log('Current Route:', currentRoute);
    if (!currentRoute) return;

    const inOnboarding = currentRoute === StackNames.Onboarding;
    const inAuthScreens = [
      StackNames.LoginScreen,
      StackNames.SignUpScreen,
      StackNames.ForgotPasswordScreen,
    ].includes(currentRoute);

    if (!hasCompletedOnboarding && !inOnboarding && !inAuthScreens) {
      reset(StackNames.Onboarding);
    }
    else if (hasCompletedOnboarding && !user && !inAuthScreens && !hasSkippedLogin) {
      reset(StackNames.LoginScreen);
    }
    else if (hasCompletedOnboarding && user && (inOnboarding || inAuthScreens)) {
      reset(StackNames.MainAppStack);
    }
  }, [user, isLoading, hasCompletedOnboarding, hasSkippedLogin]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});