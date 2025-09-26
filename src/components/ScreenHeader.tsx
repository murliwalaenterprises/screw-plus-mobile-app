/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Colors } from '../constants/Colors';
import { moderateScale } from 'react-native-size-matters';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from '@react-native-community/blur';
import { AppText } from './ui';

const ScreenHeader: React.FC<any> = ({
    navigation,
    title,
    children,
    hideBackButton,
    customBackNavigation,
}) => {
    return (
        <View style={styles.wrapper}>
            <BlurView
                style={styles.blur}
                blurType="light"
                blurAmount={25}
                reducedTransparencyFallbackColor="white"
            />
            <View style={styles.header}>
                <View style={styles.leftContainer}>
                    {!hideBackButton ? (
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}
                            onPress={() => (customBackNavigation ? navigation.navigate(customBackNavigation) : navigation.goBack())}
                        >
                            <ChevronLeft color={Colors.StatusBarTextColor} size={24} />
                            <AppText variant="medium" style={[styles.headerTitle]}>Back</AppText>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>

                <AppText variant="medium" style={{ color: Colors.StatusBarTextColor, fontWeight: '600' }}>
                    {title}
                </AppText>

                <View style={styles.rightContainer}>
                    {children ? children : <View style={styles.placeholder} />}
                </View>
            </View>
        </View>
    );
};

export default ScreenHeader;

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        width: '100%',
        zIndex: 1,
    },
    blur: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: moderateScale(60), // adjust height according to header
        zIndex: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(16),
        paddingTop: moderateScale(14),
        zIndex: 1, // above blur
        backgroundColor: 'transparent', // IMPORTANT: no solid background
    },
    leftContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    headerTitle: {
        fontWeight: '500',
        color: Colors.StatusBarTextColor,
        textAlign: 'center',
        marginLeft: moderateScale(4),
    },
    placeholder: {
        width: moderateScale(32),
        height: moderateScale(32),
    },
});
