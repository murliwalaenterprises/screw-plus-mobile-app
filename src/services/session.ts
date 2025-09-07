import EncryptedStorage from 'react-native-encrypted-storage';

export async function storeUserSession(userProfile: any, firebaseUser?: any) {
    try {
        await EncryptedStorage.setItem(
            'user_session',
            JSON.stringify({userProfile, firebaseUser})
        );
        console.log('Token stored securely');
    } catch (error) {
        console.log('Error storing token', error);
    }
}

export async function getUserSession() {
    try {
        const session = await EncryptedStorage.getItem('user_session');
        if (session) {
            return JSON.parse(session);
        }
        return null;
    } catch (error) {
        console.log('Error getting session', error);
        return null;
    }
}

export async function removeUserSession() {
    try {
        await EncryptedStorage.removeItem('user_session');
        await EncryptedStorage.removeItem('selectedLocation');
        await EncryptedStorage.removeItem('hasSkippedLogin');
        console.log('Session removed');
    } catch (error) {
        console.log('Error removing session', error);
    }
}

export async function getOnboardingSession() {
    try {
        const session = await EncryptedStorage.getItem('hasCompletedOnboarding');
        return session === 'true';
    } catch (error) {
        console.log('Error getting session', error);
        return false;
    }
}