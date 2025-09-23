/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, Alert, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { Colors } from '../../constants/Colors';
import { moderateScale } from 'react-native-size-matters';
import { AppText } from '.';

type Option = { label: string; value: string; disabled?: boolean; };

type SelectProps = {
    label?: string;
    value: string;
    valueStr?: string;
    onChange: (val: string) => void;
    options?: Option[];
    fetchOptions?: () => Promise<Option[]>;
    disabled?: boolean;

};

const Select: React.FC<SelectProps> = ({ label, value, valueStr, onChange, options = [], fetchOptions, disabled = false }) => {
    const [items, setItems] = useState<Option[]>(options);
    const [allItems, setAllItems] = useState<Option[]>(options); // original full list
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value);
    const [searchText, setSearchText] = useState('');

    // Load API options
    useEffect(() => {
        let isMounted = true;
        const loadOptions = async () => {
            if (!fetchOptions) return;
            setLoading(true);
            try {
                const data = await fetchOptions();
                if (isMounted) {
                    setAllItems(data);
                    setItems(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadOptions();
        return () => { isMounted = false; };
    }, []);

    // Filter items based on search text
    useEffect(() => {
        if (!searchText) {
            setItems(allItems);
        } else {
            const filtered = allItems.filter(opt =>
                opt.label.toLowerCase().includes(searchText.toLowerCase())
            );
            setItems(filtered);
        }
    }, [searchText, allItems]);

    const handleConfirm = () => {
        if (!selectedValue) {
            Alert.alert("Selection Required", "Please select the option to confirm");
            return;
        }
        onChange(selectedValue);
        setSelectedValue('');
        setModalVisible(false);
    };

    const handleClear = () => {
        onChange('');
        setSelectedValue('');
        setModalVisible(false);
        setSearchText('');
    };

    useEffect(() => {
        if (options.length) {
            setAllItems(options);
            setItems(options);
        }
    }, [options]);

    return (
        <View style={styles.container}>
            {/* {label && <Text style={styles.label}>{label}</Text>} */}

            {/* Input-like Select Box */}
            <TouchableOpacity
                style={[styles.inputBox, disabled && styles.disabled]}
                onPress={() => setModalVisible(true)}
                disabled={disabled}
            >
                <AppText style={{ color: value ? '#000' : '#888' }}>
                    {value ? items.find((i) => i.value === value)?.label || valueStr : '-- Select --'}
                </AppText>
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                style={styles.modal}
                avoidKeyboard
            >
                <View style={styles.modalContent}>
                    {loading ? (
                        <ActivityIndicator size="large" color="gray" />
                    ) : (
                        <>
                            <View style={{ marginBottom: 10, paddingHorizontal: 2 }}>
                                <AppText variant="medium" style={{ fontWeight: '500' }}>{label}</AppText>
                            </View>

                            {/* Search Input */}
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                value={searchText}
                                onChangeText={setSearchText}
                            />

                            <FlatList
                                data={items}
                                keyExtractor={(item) => item.value}
                                renderItem={({ item }) => {
                                    const isSelected = item.value === (selectedValue || value);
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.option,
                                                isSelected && styles.optionSelected,
                                                item.disabled && { opacity: 0.5 }
                                            ]}
                                            onPress={() => setSelectedValue(item.value)}
                                            disabled={item?.disabled}
                                        >
                                            <AppText variant="medium" style={{ flex: 1 }}>{item.label}</AppText>
                                            {isSelected && <AppText style={{ color: 'green', fontWeight: 'bold' }}>✔</AppText>}
                                        </TouchableOpacity>
                                    );
                                }}
                            />

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.secondaryButton]}
                                    onPress={handleClear}
                                >
                                    <AppText variant="medium" style={[styles.actionButtonText, styles.secondaryButtonText]}>
                                        Clear
                                    </AppText>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={handleConfirm}
                                >
                                    <AppText variant="medium" style={styles.actionButtonText}>Confirm</AppText>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginVertical: 8 },
    label: { marginBottom: 4, color: '#333' },
    inputBox: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    disabled: {
        backgroundColor: "#f5f5f5",
    },
    modal: { justifyContent: 'flex-end', margin: 0 },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '60%',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
        fontSize: moderateScale(16)
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionSelected: {
        backgroundColor: '#eee',
        borderRadius: 6,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        gap: 12,
        marginBottom: 20
    },
    actionButton: {
        flex: 1,
        backgroundColor: Colors.Primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.Primary,
    },
    actionButtonText: {
        fontWeight: '500',
        color: '#FFFFFF',
    },
    secondaryButtonText: {
        color: Colors.Primary,
    },
});

export default Select;