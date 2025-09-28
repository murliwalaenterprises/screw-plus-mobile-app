import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';

type InputProps = TextInputProps & {
    label?: string;
    value: string;
    placeholder?: string;
    onChangeText: (text: string) => void;
};

const Input: React.FC<InputProps> = ({ label, value, placeholder, onChangeText, style, ...rest }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, style]}
                value={value}
                {...rest}
                placeholder={placeholder}
                onChangeText={onChangeText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    label: { fontSize: 14, marginBottom: 4, color: '#333' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 8,
    },
});

export default Input;
