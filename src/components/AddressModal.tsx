/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */

import { Building, Home, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Address } from '../types/types';
import { Colors } from '../constants/Colors';
import AppText from './ui/AppText';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddressModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: Omit<Address, "id">, id?: string) => void;
    editingAddress?: Address | null;
}
const ADDRESS_TYPES = ["home", "work", "other"];

const getAddressIcon = (type: string, isActive: boolean = false) => {
    switch (type) {
        case 'home':
            return <Home size={18} color={isActive ? '#fff' : "#333"} />;
        case 'work':
            return <Building size={18} color={isActive ? '#fff' : "#333"} />;
        default:
            return <MapPin size={18} color={isActive ? '#fff' : "#333"} />;
    }
};

export default function AddressModal({ visible, onClose, onSave, editingAddress }: AddressModalProps) {
    const initialState: Omit<Address, "id"> = {
        type: "home",
        name: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        isDefault: false,
    };

    const [form, setForm] = useState<Omit<Address, "id">>(initialState);

    useEffect(() => {
        if (editingAddress) {
            const { ...rest } = editingAddress;
            setForm(rest);
        } else {
            setForm(initialState);
        }
    }, [editingAddress]);

    const handleChange = (key: keyof typeof form, value: string | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <ScrollView style={{ flex: 1, flexDirection: 'column' }} automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
                        <View style={styles.container}>
                            <AppText style={styles.title}>{editingAddress ? "Edit Address" : "Add Address"}</AppText>

                            {/* Address Type Select */}
                            <AppText style={styles.label}>Address Type</AppText>
                            <View style={styles.typeRow}>
                                {ADDRESS_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.typeOption,
                                            form.type === type && styles.typeOptionSelected
                                        ]}
                                        onPress={() => handleChange("type", type)}
                                    >
                                        {getAddressIcon(type, form.type === type)}
                                        <AppText
                                            style={[
                                                styles.typeText,
                                                form.type === type && styles.typeTextSelected
                                            ]}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <AppText style={styles.label}>Name *</AppText>
                            <TextInput placeholder="Name" value={form.name} onChangeText={t => handleChange("name", t)} style={styles.input} placeholderTextColor={Colors.light.placeholderTextColor} />
                            <AppText style={styles.label}>Phone *</AppText>
                            <TextInput placeholder="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={t => handleChange("phone", t)} style={styles.input} placeholderTextColor={Colors.light.placeholderTextColor} maxLength={10} />
                            <AppText style={styles.label}>Address (House No, Building, Street, Area) *</AppText>
                            <TextInput placeholder="Address (House No, Building, Street, Area)" value={form.address} onChangeText={t => handleChange("address", t)} style={styles.input} placeholderTextColor={Colors.light.placeholderTextColor} />
                            <AppText style={styles.label}>City/District *</AppText>
                            <TextInput placeholder="City/District" value={form.city} onChangeText={t => handleChange("city", t)} style={styles.input} placeholderTextColor={Colors.light.placeholderTextColor} />
                            <View style={styles.row}>
                                <View style={styles.column}>
                                    <AppText style={styles.label}>State *</AppText>
                                    <TextInput placeholder="State" value={form.state} onChangeText={t => handleChange("state", t)} style={styles.input} placeholderTextColor={Colors.light.placeholderTextColor} />
                                </View>
                                <View style={styles.column}>
                                    <AppText style={styles.label}>Pincode *</AppText>
                                    <TextInput placeholder="Pincode" keyboardType="numeric" value={form.pincode} onChangeText={t => handleChange("pincode", t)} style={styles.input} placeholderTextColor={Colors.light.placeholderTextColor} />
                                </View>
                            </View>

                            <View style={[styles.row, { justifyContent: 'flex-end' }]}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                    <AppText style={[styles.btnText, { color: '#222' }]}>Cancel</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(form, editingAddress?.id)}>
                                    <AppText style={styles.btnText}>Save</AppText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
    container: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "95%", marginHorizontal: 'auto', marginTop: '20%' },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
    input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
    row: { flexDirection: "row", justifyContent: 'space-between', marginTop: 10, width: '100%' },
    column: { width: '49%' },
    cancelBtn: { backgroundColor: "transparent", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#222' },
    saveBtn: { backgroundColor: "#333", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    btnText: { color: "#fff", fontWeight: "bold" },

    typeRow: { flexDirection: "row", marginBottom: 12 },
    typeOption: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    typeOptionSelected: {
        backgroundColor: "#333",
        borderColor: "#333",
    },
    typeText: { color: "#333" },
    typeTextSelected: { color: "#fff", fontWeight: "600" },
});
