import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StackNames } from '../constants/stackNames';
import LoginScreen from '../auth/LoginScreen';
import AuthWrapper from '../components/AuthWrapper';
import SignUpScreen from '../auth/SignupScreen';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <AuthWrapper>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name={StackNames.LoginScreen} component={LoginScreen} />
        <Stack.Screen name={StackNames.SignUpScreen} component={SignUpScreen} />
        <Stack.Screen name={StackNames.ForgotPasswordScreen} component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </AuthWrapper>
  );
};

export default AuthStack;
