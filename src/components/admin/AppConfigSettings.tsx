/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from "react-native";
import { useAppConfig } from "../../store/useAppConfig";
import { Colors } from "../../constants/Colors";
import LinearGradient from "react-native-linear-gradient";
import { AppText } from "../ui";

export default function AppConfigSettings() {
    const {
        topBarBackgroundColor,
        topBarForegroundColor,
        activeTabColor,
        homeScreenAds,
        isShowSlider,
        topBarBrandLogo,
        setConfig,
    }: any = useAppConfig();

    const [form, setForm] = useState({
        topBarBackgroundColor: topBarBackgroundColor.join(","),
        topBarForegroundColor,
        activeTabColor: activeTabColor || "",
        homeScreenAds: homeScreenAds.join(","),
        isShowSlider,
        topBarBrandLogo,
    });

    useEffect(() => {
        setForm({
            topBarBackgroundColor: topBarBackgroundColor.join(","),
            topBarForegroundColor,
            activeTabColor: activeTabColor || "",
            homeScreenAds: homeScreenAds.join(","),
            isShowSlider,
            topBarBrandLogo,
        });
    }, [topBarBackgroundColor, topBarForegroundColor, activeTabColor, homeScreenAds, isShowSlider, topBarBrandLogo]);

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const config = {
            topBarBackgroundColor: form.topBarBackgroundColor.split(",").map((c: any) => c.trim()),
            topBarForegroundColor: form.topBarForegroundColor,
            activeTabColor: form.activeTabColor || undefined,
            homeScreenAds: form.homeScreenAds.split(",").map((c: any) => c.trim()),
            isVisibleSlider: form.isShowSlider,
            topBarBrandLogo: form.topBarBrandLogo,
        };

        try {
            setConfig(config);
            Alert.alert("Config updated successfully!");
        } catch (error) {
            console.error("Error saving config:", error);
            Alert.alert("Failed to save config");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>App Configuration</Text>

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 5,
                }}
            >
                <Text style={styles.label}>Top Bar Background Colors (comma separated)</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    {form.topBarBackgroundColor.split(",").map((color: any, index: number) => (
                        <View
                            key={index}
                            style={{
                                width: 14,
                                height: 14,
                                backgroundColor: color.trim(),
                                borderRadius: 100,
                                marginLeft: index > 0 ? 4 : 0,
                            }}
                        />
                    ))}
                </View>
            </View>

            <TextInput
                style={styles.input}
                value={form.topBarBackgroundColor}
                onChangeText={(text) => handleChange("topBarBackgroundColor", text)}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={styles.label}>Top Bar Foreground Color</Text>
                <View style={{ width: 15, height: 15, backgroundColor: form.topBarForegroundColor, borderRadius: 100 }} />
            </View>

            <TextInput
                style={styles.input}
                value={form.topBarForegroundColor}
                onChangeText={(text) => handleChange("topBarForegroundColor", text)}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={styles.label}>Active Tab Color</Text>
                <View style={{ width: 15, height: 15, backgroundColor: form.activeTabColor, borderRadius: 100 }} />
            </View>
            <TextInput
                style={styles.input}
                value={form.activeTabColor}
                onChangeText={(text) => handleChange("activeTabColor", text)}
            />

            <Text style={styles.label}>Home Screen Ads (comma separated URLs)</Text>
            <TextInput
                style={styles.input}
                value={form.homeScreenAds}
                onChangeText={(text) => handleChange("homeScreenAds", text)}
            />

            <Text style={styles.label}>Top Bar Brand Logo (URL)</Text>
            <TextInput
                style={styles.input}
                value={form.topBarBrandLogo}
                onChangeText={(text) => handleChange("topBarBrandLogo", text)}
            />

            <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Show Slider</Text>
                        <Text style={styles.settingSubtitle}>Hide slider for home screen</Text>
                    </View>
                </View>
                <Switch
                    value={form.isShowSlider}
                    onValueChange={() => handleChange("isShowSlider", !form.isShowSlider)}
                    trackColor={{ false: '#e9ecef', true: Colors.light.success }}
                    thumbColor="#fff"
                />
            </View>

            <TouchableOpacity style={{ marginTop: 20 }} onPress={handleSave}>
                <LinearGradient
                    colors={[Colors.light.primaryButtonBackground.start, Colors.light.primaryButtonBackground.end]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 8 }}
                >
                    <View style={styles.saveButton}>
                        <AppText style={styles.saveText}>Save Config</AppText>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: Colors.ScreenBGColor },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
        fontSize: 14,
    },
    toggle: {
        padding: 10,
        borderRadius: 6,
        minWidth: 70,
        alignItems: "center",
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveText: {
        color: Colors.light.primaryButtonForeground,
        fontWeight: 'bold',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingText: {
        marginLeft: 12,
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginVertical: 16,
    },
});
