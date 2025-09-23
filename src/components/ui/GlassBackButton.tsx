import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from '@react-native-community/blur'; // Expo: 'expo-blur'
import LinearGradient from 'react-native-linear-gradient';

export default function GlassBackButton({ navigation, customBackNavigation }: any) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
                customBackNavigation
                    ? navigation.navigate(customBackNavigation)
                    : navigation.goBack()
            }
            style={styles.buttonWrapper}
        >
            {/* Background Blur / Fallback Gradient */}
            {Platform.OS === 'ios' ? (
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={15}
                    reducedTransparencyFallbackColor="rgba(255,255,255,0.15)"
                />
            ) : (
                <LinearGradient
                    colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            )}

            {/* Inner Shine Overlay */}
            <LinearGradient
                colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.05)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Border */}
            <LinearGradient
                colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)']}
                style={styles.glassBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Icon */}
            <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 50,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)', // fallback for Android
    },
    glassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
});
