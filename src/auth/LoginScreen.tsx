/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/Colors';
import { StackNames } from '../constants/stackNames';
import { useAuth } from '../context/AuthContext';
import { getUserSession } from '../services/session';

export default function LoginScreen({ navigation }: any) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [checkLogin, setCheckLogin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signIn, skipLogin, completeOnboarding, setUserProfile, setUser } = useAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        const result = await signIn(email.trim(), password);
        console.log('Login result:', result);
        setIsLoading(false);

        if (result.success) {
            await completeOnboarding();
            navigation.navigate(StackNames.SignUpScreen);
        } else {
            Alert.alert('Login Failed', result.error || 'An error occurred');
        }
    };

    const handleSkipLogin = async () => {
        await skipLogin();
        navigation.navigate(StackNames.MainAppStack);
    };

    const handleForgotPassword = () => {
        navigation.navigate(StackNames.ForgotPasswordScreen);
    };

    const handleSignUp = () => {
        navigation.navigate(StackNames.SignUpScreen);
    };

    React.useEffect(() => {
        getUserSession().then((oUser: any) => {
            console.log("User session found:", oUser);
            if (oUser && oUser.userProfile) {
                setUserProfile(oUser?.userProfile);
                setUser(oUser?.firebaseUser);
                navigation.reset({
                    index: 0,
                    routes: [
                        {
                            name: StackNames.MainAppStack,
                        },
                    ],
                });
                return;
            }
            setCheckLogin(true);
        });
    }, []);

    if (!checkLogin) {
        return;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Image
                            source={require('../assets/images/new-logo-black.png')}
                            style={{
                                width: 220,
                                height: 40,
                                marginBottom: 20,
                            }}
                        />
                        <Text style={styles.title}>Welcome Back!</Text>
                        <Text style={styles.subtitle}>Sign in to continue shopping</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Mail size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                placeholderTextColor={Colors.light.placeholderTextColor}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Lock size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                placeholderTextColor={Colors.light.placeholderTextColor}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color="#666" />
                                ) : (
                                    <Eye size={20} color="#666" />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            style={styles.loginButton}
                        >
                            <LinearGradient
                                colors={[Colors.light.primaryButtonBackground.start, Colors.light.primaryButtonBackground.end]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.loginButtonGradient}>
                                    <Text style={styles.loginButtonText}>
                                        {isLoading ? 'Signing In...' : 'Sign In'}
                                    </Text>
                                    <ArrowRight size={20} color="#fff" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            disabled={isLoading}
                            style={styles.socialButton}
                        >
                            <Image
                                source={require('../assets/images/google_logo.png')}
                                style={{
                                    width: 20,
                                    height: 20,
                                    marginRight: 8,
                                }}
                            />
                            <Text style={styles.socialButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        {Platform.OS === 'ios' && (
                            <TouchableOpacity
                                disabled={isLoading}
                                style={[styles.socialButton, styles.appleButton]}
                            >
                                <Image
                                    source={{ uri: 'https://pngimg.com/d/apple_logo_PNG19680.png' }}
                                    style={{
                                        width: 16,
                                        height: 20,
                                        marginRight: 8,
                                    }}
                                />
                                <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                                    Continue with Apple
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleSkipLogin} style={styles.skipButton}>
                            <Text style={styles.skipButtonText}>Skip for now</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signUpText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#f9f9f9',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#666',
    },
    socialButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    appleButton: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    appleButtonText: {
        color: '#fff',
    },
    skipButton: {
        alignItems: 'center',
        marginTop: 16,
        paddingVertical: 12,
    },
    skipButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 50
    },
    footerText: {
        fontSize: 16,
        color: '#666',
    },
    signUpText: {
        fontSize: 16,
        color: '#667eea',
        fontWeight: '600',
    },
});