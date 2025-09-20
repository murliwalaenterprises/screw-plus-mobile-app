import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    StatusBar,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';

const AppHeader = ({ title }: any) => {
    return (
        <View style={styles.container}>
            <BlurView
                style={styles.blurContainer}
                blurType={Platform.OS === 'ios' ? 'light' : 'dark'}
                blurAmount={10}
                reducedTransparencyFallbackColor="white">
                <Text style={styles.title}>{title}</Text>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    blurContainer: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
});

export default AppHeader;
