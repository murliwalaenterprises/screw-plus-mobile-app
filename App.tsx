import React from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';  // ⬅️ add this
import RootStack from './src/routers/RootStack';
import LoginScreen from './src/auth/LoginScreen';
import { navigationRef } from './src/helper/NavigationService';
import { Colors } from './src/constants/Colors';
import AuthWrapper from './src/components/AuthWrapper';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FirebaseDataProvider } from './src/store/useFirebaseData';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: Colors.defaultBlack,
    background: Colors.defaultWhite,
  },
};

const queryClient = new QueryClient();

export const routeNameRef: React.MutableRefObject<string | null | undefined> =
  React.createRef<string | null | undefined>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const lastRouteNameRef = React.useRef<string | null>(null);



  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <StatusBar
          barStyle="default" // "dark-content" or "light-content"
          backgroundColor="transparent" // Android background color
          translucent={true}       // true makes content go under status bar
        />

        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <FirebaseDataProvider>
              {/* Set status bar style */}
              <NavigationContainer
                theme={MyTheme}
                ref={navigationRef}
                onReady={() => {
                  routeNameRef.current =
                    navigationRef?.current?.getCurrentRoute()?.name;
                }}
                onStateChange={() => {
                  const currentRouteName =
                    navigationRef?.current?.getCurrentRoute()?.name;
                  lastRouteNameRef.current = currentRouteName ?? null;
                  routeNameRef.current = currentRouteName;
                }}
              >

                <AuthWrapper>
                  <RootStack />
                </AuthWrapper>
              </NavigationContainer>
            </FirebaseDataProvider>
          </AuthProvider>
        </QueryClientProvider>


        {/* <LoginScreen/> */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <Text style={styles.text}>Hello, React Native is working 🎉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default App;