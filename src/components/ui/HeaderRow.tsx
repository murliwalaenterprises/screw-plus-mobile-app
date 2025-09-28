/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { AppText, ElasticButton } from "."; // tumhara custom text component

type HeaderRowProps = {
    title: string;
    onPress?: () => void;
    buttonText?: string;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
    buttonTextStyle?: TextStyle;
    buttonDisabled?: boolean;
};

const HeaderRow: React.FC<HeaderRowProps> = ({
    title,
    onPress,
    buttonText = "Save",
    containerStyle,
    titleStyle,
    buttonTextStyle,
    buttonDisabled = false,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <AppText variant="medium" style={[styles.title, titleStyle]}>
                {title}
            </AppText>
            {onPress && (
                <ElasticButton isDisabled={buttonDisabled} icon={<View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <AppText variant="small" style={[styles.buttonText, buttonTextStyle]}>
                        {buttonText}
                    </AppText>
                </View>} onPress={() => onPress()} />
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
        color: "#222",
    },
});
