import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { moderateScale } from 'react-native-size-matters';
import { ChevronLeft } from 'lucide-react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenHeader: React.FC<any> = ({
    navigation,
    title,
    children,
    hideBackButton,
    customBackNavigation,
}) => {
    // const insets = useSafeAreaInsets();
    return (
        <View style={[styles.header]}>
            <View style={styles.leftContainer}>
                {hideBackButton ? (
                    customBackNavigation ? (
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }} onPress={() => navigation.navigate(customBackNavigation)}>
                            <ChevronLeft color="#1C1C1E" size={24} />
                            <Text style={[styles.headerTitle, { textAlign: 'left', fontWeight: '500' }]}>Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholder} />
                    )
                ) : (
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }} onPress={() => navigation.goBack()}>
                        <ChevronLeft color="#1C1C1E" size={24} />
                        <Text style={[styles.headerTitle, { textAlign: 'left' }]}>Back</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={{ color: '#000', fontSize: 16.5, fontWeight: '600' }}>{title}</Text>

            <View style={styles.rightContainer}>
                {children ? children : <View style={styles.placeholder} />}
            </View>
        </View>
    );
};

export default ScreenHeader;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(16),
        // borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: 1,
        borderBottomColor: '#dedede',
        paddingVertical: moderateScale(10),
        // backgroundColor: Colors.primary,
        // backgroundColor: '#fff',

        // paddingBottom: scale(5),
        // paddingTop: Platform.OS === 'android' ? scale(30) : scale(6),
        // marginHorizontal: scale(10),
        // borderRadius: scale(10),
        // borderWidth: scale(1),
        // borderColor: '#dedede',


        // // ✅ Shadow for iOS
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 3,

        // // ✅ Elevation for Android
        // elevation: 3,
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
        fontSize: moderateScale(16),
        // color: '#fff',
        color: Colors.StatusBarTextColor,
        flex: 2,
        textAlign: 'center',
    },
    backButton: {
        padding: moderateScale(4),
    },
    placeholder: {
        width: moderateScale(32),
        height: moderateScale(32),
    },
});
