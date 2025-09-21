
import {
    Calendar,
    CheckCircle,
    Mail,
    Phone,
    Save,
    User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/Colors';
import ScreenHeader from '../components/ScreenHeader';
import { StackNames } from '../constants/StackNames';

export default function EditProfileScreen({ navigation }: any) {
    const { userProfile, updateUserProfile, user } = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setDisplayName(userProfile.displayName || '');
            setEmail(userProfile.email || '');
            setPhoneNumber(userProfile.phoneNumber || '');
            setAddress(userProfile.address || '');
            setCity(userProfile.city || '');
            setState(userProfile.state || '');
            setPincode(userProfile.pincode || '');
            setDateOfBirth(userProfile.dateOfBirth || '');
            setGender(userProfile.gender || '');
        } else if (user) {
            setDisplayName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [userProfile, user]);

    const handleSave = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setIsLoading(true);
        const result = await updateUserProfile({
            displayName: displayName.trim() || '',
            phoneNumber: phoneNumber.trim() || '',
            address: address.trim() || '',
            city: city.trim() || '',
            state: state.trim() || '',
            pincode: pincode.trim() || '',
            dateOfBirth: dateOfBirth.trim() || '',
            gender: gender || 'male',
        });
        setIsLoading(false);

        if (result.success) {
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', result.error || 'Failed to update profile');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScreenHeader
                title={StackNames.EditProfile}
                navigation={navigation}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <User size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoCapitalize="words"
                                testID="name-input"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Mail size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                placeholder="Email"
                                value={email}
                                editable={false}
                                testID="email-input"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Phone size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                testID="phone-input"
                            />
                        </View>

                        {/* <View style={styles.inputContainer}>
                            <MapPin size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Address"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                testID="address-input"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    value={city}
                                    onChangeText={setCity}
                                    testID="city-input"
                                />
                            </View>

                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="State"
                                    value={state}
                                    onChangeText={setState}
                                    testID="state-input"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Pincode"
                                value={pincode}
                                onChangeText={setPincode}
                                keyboardType="numeric"
                                testID="pincode-input"
                            />
                        </View> */}

                        <View style={styles.inputContainer}>
                            <Calendar size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Date of Birth (DD/MM/YYYY)"
                                value={dateOfBirth}
                                onChangeText={setDateOfBirth}
                                testID="dob-input"
                            />
                        </View>

                        <View style={styles.genderContainer}>
                            <Text style={styles.genderLabel}>Gender</Text>
                            <View style={styles.genderOptions}>
                                {['male', 'female', 'other'].map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        onPress={() => setGender(option as 'male' | 'female' | 'other')}
                                        style={[
                                            styles.genderOption,
                                            gender === option && styles.genderOptionSelected,
                                        ]}
                                    >
                                        {gender === option && (<CheckCircle size={16} color="#fff" />)}
                                        <Text
                                            style={[
                                                styles.genderOptionText,
                                                gender === option && styles.genderOptionTextSelected,
                                            ]}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isLoading}
                            style={styles.saveButton}
                            testID="save-button"
                        >
                            <LinearGradient
                                colors={[Colors.light.primaryButtonBackground.start, Colors.light.primaryButtonBackground.end]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.saveButtonGradient}>
                                    <Save size={20} color={Colors.light.primaryButtonForeground} />
                                    <Text style={styles.saveButtonText}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Text>
                                </View>
                            </LinearGradient>
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
        backgroundColor: Colors.StatusBarBg,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: '#fff'
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
    disabledInput: {
        color: '#999',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfWidth: {
        width: '48%',
    },
    genderContainer: {
        marginBottom: 24,
    },
    genderLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 12,
    },
    genderOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4,
    },
    genderOptionSelected: {
        borderColor: '#333',
        backgroundColor: '#333',
    },
    genderOptionText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    genderOptionTextSelected: {
        color: '#fff',
    },
    saveButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 16,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.primaryButtonForeground,
        marginLeft: 8,
    },
});