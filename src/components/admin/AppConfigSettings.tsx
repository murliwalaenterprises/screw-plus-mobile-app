/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, Image } from "react-native";
import { useAppConfig } from "../../store/useAppConfig";
import { Colors } from "../../constants/Colors";
import LinearGradient from "react-native-linear-gradient";
import { AppText } from "../ui";
import { PlusCircle, X } from "lucide-react-native";

export default function AppConfigSettings() {
    const {
        topBarBackgroundColor,
        topBarForegroundColor,
        activeTabColor,
        homeScreenAds,
        isShowSlider,
        isShowCategorySection,
        topBarBrandLogo,
        setConfig,
    }: any = useAppConfig();

    const [form, setForm] = useState({
        topBarBackgroundColor: topBarBackgroundColor.join(","),
        topBarForegroundColor,
        activeTabColor: activeTabColor || "",
        homeScreenAds,
        isShowSlider,
        isShowCategorySection,
        topBarBrandLogo,
    });

    const [tempImageUrl, setTempImageUrl] = useState("");

    useEffect(() => {
        setForm({
            topBarBackgroundColor: topBarBackgroundColor.join(","),
            topBarForegroundColor,
            activeTabColor: activeTabColor || "",
            homeScreenAds,
            isShowSlider,
            isShowCategorySection,
            topBarBrandLogo,
        });
    }, [topBarBackgroundColor, topBarForegroundColor, activeTabColor, homeScreenAds, isShowSlider, isShowCategorySection, topBarBrandLogo]);

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const config = {
            topBarBackgroundColor: form.topBarBackgroundColor.split(",").map((c: any) => c.trim()),
            topBarForegroundColor: form.topBarForegroundColor,
            activeTabColor: form.activeTabColor || undefined,
            homeScreenAds: form.homeScreenAds,
            isVisibleSlider: form.isShowSlider,
            isVisibleCategorySection: form.isShowCategorySection,
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

    const addImageByUrl = () => {
        const url = (tempImageUrl || "").trim();
        if (!url) return;
        if (form.homeScreenAds.length >= 5) {
            Alert.alert("Limit reached", "You can upload a maximum of 5 images.");
            return;
        }
        setForm((p) => ({ ...p, homeScreenAds: [...p.homeScreenAds, url] }));
        setTempImageUrl("");
    };

    const removeImage = (index: number) => {
        setForm((p) => ({
            ...p,
            homeScreenAds: p.homeScreenAds.filter((_: string, i: number) => i !== index),
        }));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: '40%' }}>
            <Text style={styles.title}>App Configuration</Text>


            {/* Images */}
            <Text style={styles.label}>Images (max 5)</Text>

            <View style={styles.imageList}>
                {form.homeScreenAds.map((uri: string, idx: number) => (
                    <View key={idx} style={styles.thumbWrap}>
                        <Image source={{ uri }} style={styles.thumb} />
                        <TouchableOpacity
                            style={styles.removeBadge}
                            onPress={() => removeImage(idx)}
                        >
                            <X size={14} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ))}
                {form.homeScreenAds.length < 5 && (
                    <TouchableOpacity
                        style={[styles.thumbWrap, styles.thumbAdd]}
                        onPress={() => {
                            if (tempImageUrl.trim()) addImageByUrl();
                        }}
                    >
                        <PlusCircle size={26} color="#6B7280" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
                <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="https://example.com/image.jpg"
                    value={tempImageUrl}
                    onChangeText={setTempImageUrl}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                />
                <TouchableOpacity style={styles.pillButton} onPress={addImageByUrl}>
                    <Text style={styles.pillText}>Add URL</Text>
                </TouchableOpacity>
            </View>

            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 5,
                }}
            >
                <Text style={styles.label}>Top Bar Background Colors (comma separated)</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: '#fff', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: '#dedede' }}>
                    {topBarBackgroundColor.map((color: any, index: number) => (
                        <View
                            key={index}
                            style={{
                                width: 14,
                                height: 14,
                                backgroundColor: color.trim(),
                                borderRadius: 100,
                                marginLeft: index > 0 ? 4 : 0,
                                borderWidth: 1, borderColor: '#dedede'
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
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: '#fff', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: '#dedede' }}>
                    <View
                        style={{
                            width: 14,
                            height: 14,
                            backgroundColor: topBarForegroundColor,
                            borderRadius: 100,
                            borderWidth: 1, borderColor: '#dedede'
                        }}
                    />
                </View>
            </View>

            <TextInput
                style={styles.input}
                value={form.topBarForegroundColor}
                onChangeText={(text) => handleChange("topBarForegroundColor", text)}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <Text style={styles.label}>Active Tab Color</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: '#fff', padding: 5, borderRadius: 8, borderWidth: 1, borderColor: '#dedede' }}>
                    <View
                        style={{
                            width: 14,
                            height: 14,
                            backgroundColor: activeTabColor,
                            borderRadius: 100,
                            borderWidth: 1, borderColor: '#dedede'
                        }}
                    />
                </View>
            </View>
            <TextInput
                style={styles.input}
                value={form.activeTabColor}
                onChangeText={(text) => handleChange("activeTabColor", text)}
            />

            {/* <Text style={styles.label}>Home Screen Ads (comma separated URLs)</Text>
            <TextInput
                style={styles.input}
                value={form.homeScreenAds}
                onChangeText={(text) => handleChange("homeScreenAds", text)}
            /> */}

            {form.topBarBrandLogo && (<Image source={{ uri: form.topBarBrandLogo }} width={100} height={30} />)}
            <Text style={styles.label}>Top Bar Brand Logo (URL)</Text>
            <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                value={form.topBarBrandLogo}
                onChangeText={(text) => handleChange("topBarBrandLogo", text)}
            />
            <Text style={[styles.settingSubtitle, { marginBottom: 20 }]}>Use your brand logo for the home screen in your app. {"\n"}
                Recommended resolution: 1200 × 320 px (wide rectangular format). {"\n"}
                Transparent PNG is preferred for best results.</Text>

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

            <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                    <View style={styles.settingText}>
                        <Text style={styles.settingTitle}>Hide Category Section?</Text>
                        <Text style={styles.settingSubtitle}>Hide Category section from home screen</Text>
                    </View>
                </View>
                <Switch
                    value={form.isShowCategorySection}
                    onValueChange={() => handleChange("isShowCategorySection", !form.isShowCategorySection)}
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

    // Images
    imageList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    thumbWrap: {
        width: 72,
        height: 72,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    thumb: { width: "100%", height: "100%" },
    thumbAdd: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
    },
    removeBadge: {
        position: "absolute",
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
    },
    pillButton: {
        backgroundColor: "#111827",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
    },
    pillText: { color: "#fff", fontWeight: "600" },

    row: { flexDirection: "row", alignItems: "flex-start" },
});
