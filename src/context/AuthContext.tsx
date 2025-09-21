/* eslint-disable @typescript-eslint/no-unused-vars */
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithCredential, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { auth, db } from "../config/firebase";
import EncryptedStorage from "react-native-encrypted-storage";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { getUserSession, removeUserSession, storeUserSession } from "../services/session";
// import EncryptedStorage from "react-native-encrypted-storage";

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    createdAt: Date;
    updatedAt: Date;
    isAdmin?: boolean;
}

export interface AuthState {
    user: User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    hasCompletedOnboarding: boolean;
    selectedLocation: string;
    updateSelectedLocation: (location: string) => Promise<any>;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
    // signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    // signInWithApple: () => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<{ success: boolean; error?: string }>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
    completeOnboarding: () => Promise<void>;
    skipLogin: () => Promise<void>;
    hasSkippedLogin: boolean;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}



// Create Context
const AuthContext = createContext<AuthState | undefined>(undefined);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [hasSkippedLogin, setHasSkippedLogin] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');

    const loadUserProfile = useCallback(async (uid: string, dataSession?: any) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                console.log('User profile data:', data);
                const profile = {
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as UserProfile;
                setUserProfile(profile);
                console.log('Existing session data:', dataSession);
                if (dataSession) {
                    await storeUserSession(profile, dataSession?.firebaseUser);
                }
                if (data.selectedLocation) {
                    setSelectedLocation(data.selectedLocation);
                    await EncryptedStorage.setItem('selectedLocation', data.selectedLocation);
                }
            }
        } catch (error) {
            console.log('Error loading user profile:', error);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);


            if (firebaseUser) {
                const dataSession = await getUserSession();
                await storeUserSession(dataSession?.userProfile, firebaseUser)
                await loadUserProfile(firebaseUser.uid, dataSession);
            } else {
                setUserProfile(null);
            }

            setIsLoading(false);
        });

        const loadOnboardingStatus = async () => {
            try {
                const status = await EncryptedStorage.getItem('hasCompletedOnboarding');
                setHasCompletedOnboarding(status === 'true');
            } catch (error) {
                console.log('Error loading onboarding status:', error);
            }
        };

        const loadSelectedLocation = async () => {
            try {
                const location = await EncryptedStorage.getItem('selectedLocation');
                if (location) {
                    setSelectedLocation(location);
                }
            } catch (error) {
                console.log('Error loading selected location:', error);
            }
        };

        loadOnboardingStatus();
        loadSelectedLocation();

        return unsubscribe;
    }, [loadUserProfile]);

    const signUp = useCallback(async (email: string, password: string, displayName: string) => {
        try {
            setIsLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            await updateProfile(userCredential.user, { displayName });

            const oUserProfile: UserProfile = {
                uid: userCredential.user.uid,
                email: userCredential.user.email!,
                displayName,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(doc(db, 'users', userCredential.user.uid), oUserProfile);

            return { success: true };
        } catch (error: any) {
            console.log('Sign up error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const oUser = await signInWithEmailAndPassword(auth, email, password);
            console.log('Signed in user:', oUser);
            return { success: true };

        } catch (error: any) {
            console.log('Sign in error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // const signInWithGoogle = useCallback(async () => {
    //     try {
    //         setIsLoading(true);

    //         const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'screwplus', path: 'redirect' });

    //         const request = new AuthSession.AuthRequest({
    //             clientId: '947363907554-hiplrjvs4ahnsl8de9ug6fktt5oshl8v.apps.googleusercontent.com',
    //             scopes: ['openid', 'profile', 'email'],
    //             redirectUri: redirectUrl,
    //             responseType: AuthSession.ResponseType.IdToken,
    //             usePKCE: true,
    //             extraParams: {
    //                 prompt: 'consent',
    //                 access_type: 'offline',
    //             },
    //         });

    //         const discovery = {
    //             authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    //             tokenEndpoint: 'https://oauth2.googleapis.com/token',
    //             revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    //         };

    //         const result = await request.promptAsync(discovery);
    //         console.log('Google sign in result:', result);


    //         if (result.type === 'success' && result.params.id_token) {
    //             const credential = GoogleAuthProvider.credential(result.params.id_token);
    //             const userCredential = await signInWithCredential(auth, credential);

    //             const existingProfile = await getDoc(doc(db, 'users', userCredential.user.uid));

    //             if (!existingProfile.exists()) {
    //                 const userProfile: UserProfile = {
    //                     uid: userCredential.user.uid,
    //                     email: userCredential.user.email!,
    //                     displayName: userCredential.user.displayName || 'User',
    //                     photoURL: userCredential.user.photoURL || undefined,
    //                     createdAt: new Date(),
    //                     updatedAt: new Date(),
    //                 };

    //                 await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    //             }

    //             return { success: true };
    //         }

    //         return { success: false, error: 'Google sign in cancelled' };
    //     } catch (error: any) {
    //         console.log('Google sign in error:', error);
    //         return { success: false, error: error.message };
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, []);

    // const signInWithApple = useCallback(async () => {
    //     try {
    //         setIsLoading(true);

    //         if (Platform.OS !== 'ios') {
    //             return { success: false, error: 'Apple Sign In is only available on iOS' };
    //         }

    //         const appleResult = await AppleAuthentication.signInAsync({
    //             requestedScopes: [
    //                 AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    //                 AppleAuthentication.AppleAuthenticationScope.EMAIL,
    //             ],
    //         });

    //         if (!appleResult.identityToken) {
    //             return { success: false, error: 'No identity token returned' };
    //         }

    //         // Firebase me sign-in
    //         // Firebase Apple OAuth
    //         const provider = new OAuthProvider('apple.com');
    //         const credential = provider.credential({
    //             idToken: appleResult.identityToken,
    //         });

    //         const userCredential = await signInWithCredential(auth, credential);

    //         // Firestore me profile check/create
    //         const existingProfile = await getDoc(doc(db, 'users', userCredential.user.uid));

    //         if (!existingProfile.exists()) {
    //             const userProfile: UserProfile = {
    //                 uid: userCredential.user.uid,
    //                 email: userCredential.user.email || appleResult.email || '',
    //                 displayName:
    //                     userCredential.user.displayName ||
    //                     `${appleResult.fullName?.givenName || ''} ${appleResult.fullName?.familyName || ''}`.trim() ||
    //                     'User',
    //                 photoURL: userCredential.user.photoURL || undefined,
    //                 createdAt: new Date(),
    //                 updatedAt: new Date(),
    //             };

    //             await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    //         }

    //         return { success: true };
    //     } catch (error: any) {
    //         console.log('Apple sign in error:', error);
    //         return { success: false, error: error.message };
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, []);

    const forgotPassword = useCallback(async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error: any) {
            console.log('Forgot password error:', error);
            return { success: false, error: error.message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            let res = await signOut(auth);
            console.log('Signed out:', res);
            await removeUserSession();
            return { success: true };
        } catch (error: any) {
            console.log('Logout error:', error);
            return { success: false, error: error.message };
        }
    }, []);

    const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
        try {
            if (!user) return { success: false, error: 'No user logged in' };
            const updatedProfile = {
                ...updates,
                updatedAt: new Date(),
            };
            console.log('Updating user profile with:', { db, updatedProfile, user, });
            await updateDoc(doc(db, 'users', user?.uid), updatedProfile);
            await loadUserProfile(user?.uid);

            return { success: true };
        } catch (error: any) {
            console.log('Update profile error:', error);
            return { success: false, error: error.message };
        }
    }, [user, loadUserProfile]);

    const completeOnboarding = useCallback(async () => {
        try {
            await EncryptedStorage.setItem('hasCompletedOnboarding', 'true');
            setHasCompletedOnboarding(true);
        } catch (error) {
            console.log('Error completing onboarding:', error);
        }
    }, []);

    const skipLogin = useCallback(async () => {
        try {
            await EncryptedStorage.setItem('hasSkippedLogin', 'true');
            setHasCompletedOnboarding(true);
            setHasSkippedLogin(true);
        } catch (error) {
            console.log('Error skipping login:', error);
        }
    }, []);

    const updateSelectedLocation = useCallback(async (location: string) => {
        try {
            await EncryptedStorage.setItem('selectedLocation', location);
            setSelectedLocation(location);

            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    selectedLocation: location,
                    updatedAt: new Date(),
                });
            }
        } catch (error) {
            console.log('Error updating selected location:', error);
        }
    }, [user]);

    const value = useMemo(
        () => ({
            user,
            userProfile,
            isLoading,
            hasCompletedOnboarding,
            hasSkippedLogin,
            selectedLocation,
            signUp,
            signIn,
            // signInWithGoogle,
            // signInWithApple,
            forgotPassword,
            logout,
            updateUserProfile,
            completeOnboarding,
            skipLogin,
            updateSelectedLocation,
            setUserProfile,
            setUser

        }),
        [user,
            userProfile,
            isLoading,
            hasCompletedOnboarding,
            hasSkippedLogin,
            selectedLocation,
            signUp,
            signIn,
            // signInWithGoogle,
            // signInWithApple,
            forgotPassword,
            logout,
            updateUserProfile,
            completeOnboarding,
            skipLogin,
            updateSelectedLocation,
            setUserProfile,
            setUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
