import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { AppText } from "."; // tumhara custom text component

type HeaderRowProps = {
    title: string;
    onPress?: () => void;
    buttonText?: string;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    buttonTextStyle?: TextStyle;
};

const HeaderRow: React.FC<HeaderRowProps> = ({
    title,
    onPress,
    buttonText = "Save",
    containerStyle,
    titleStyle,
    buttonTextStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <AppText variant="medium" style={[styles.title, titleStyle]}>
                {title}
            </AppText>

            {onPress && (
                <TouchableOpacity onPress={onPress}>
                    <AppText variant="medium" style={[styles.buttonText, buttonTextStyle]}>
                        {buttonText}
                    </AppText>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default HeaderRow;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20, // default
    },
    title: {
        fontWeight: "500",
        fontSize: 16,
        color: "#000",
    },
    buttonText: {
        fontWeight: "500",
        fontSize: 16,
        color: "#222",
    },
});
