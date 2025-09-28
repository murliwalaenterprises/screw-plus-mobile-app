import { StyleSheet } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";
import { Colors } from "../constants/Colors";

export const CustomStyles = StyleSheet.create({
    // Primary button (filled, iOS style)
    buttonPrimary: {
        backgroundColor: Colors.Primary, // iOS blue
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPrimaryText: {
        color: "#fff",
        fontSize: moderateScale(16),
        fontWeight: "600",
    },

    // Secondary button (outline)
    buttonSecondary: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: Colors.Primary,
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
    },
    buttonSecondaryText: {
        color: Colors.Primary,
        fontSize: moderateScale(16),
        fontWeight: "600",
    },

    // Destructive button (red, e.g., delete)
    buttonDestructive: {
        backgroundColor: "#ff3b30",
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(20),
        borderRadius: moderateScale(10),
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDestructiveText: {
        color: "#fff",
        fontSize: moderateScale(16),
        fontWeight: "600",
    },

    // Small iOS style button (for nav/header)
    buttonSmall: {
        paddingVertical: moderateScale(6),
        paddingHorizontal: moderateScale(12),
        borderRadius: moderateScale(8),
        alignItems: "center",
        justifyContent: "center",
    },
    buttonSmallText: {
        color: Colors.Primary,
        fontSize: moderateScale(14),
        fontWeight: "500",
    },

    submitButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: scale(12),
        backgroundColor: Colors.light.primaryButtonBackground.start,
        marginLeft: 8,
    },
    submitButtonText: {
        color: Colors.light.primaryButtonForeground,
        fontWeight: '500',
    },
});
