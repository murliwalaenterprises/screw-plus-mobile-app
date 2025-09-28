/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from "react";
import {
    Modal,
    TouchableWithoutFeedback,
    View,
    Animated,
    StyleSheet,
    ScrollView,
} from "react-native";
import { BlurView } from "@react-native-community/blur";
import { ElasticButton } from ".";

const BottomSheetModal = ({ visible, onClose, children }: any) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        if (visible) {
            // Reset values before starting
            scaleAnim.setValue(0.8);
            opacityAnim.setValue(0);
            translateY.setValue(100);

            // OPEN animation with bounce directly to 1
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,           // final value = 1
                    friction: 5,          // bounce smoothness
                    tension: 120,         // bounce strength
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 6,
                    tension: 120,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // CLOSE animation with fade + bounce down
            Animated.parallel([
                // Scale down slightly for elastic shrink
                Animated.spring(scaleAnim, {
                    toValue: 0.9,
                    friction: 5,
                    tension: 120,
                    useNativeDriver: true,
                }),
                // Slide down with bounce/elastic feel
                Animated.spring(translateY, {
                    toValue: 300, // screen ke bottom ke liye adjust karo
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                }),
                // Fade out
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onClose(); // finally modal close
            });
        }
    }, [visible]);


    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                {/* Backdrop tap = close */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                {/* Close button top center */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                    <ElasticButton onPress={onClose} isDark={false} />
                </View>

                {/* Bottom Sheet */}
                <Animated.View
                    style={[
                        styles.shadowWrapper,
                        {
                            opacity: opacityAnim,
                            transform: [{ translateY }, { scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.glassContainer}>
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="light"
                            blurAmount={10}
                            reducedTransparencyFallbackColor="white"
                        />
                        <ScrollView style={{ padding: 20 }}>{children}</ScrollView>
                    </View>
                </Animated.View>
            </View>
        </Modal>

    );
};

export default BottomSheetModal;

const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.8)" },
    shadowWrapper: {
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 }, // vertical offset
        shadowOpacity: 0.15,                   // soft opacity
        shadowRadius: 20,                       // big blur radius
        elevation: 10,                          // android elevation
        backgroundColor: "transparent",
        minWidth: 200,
    },
    glassContainer: {
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,1)",
        overflow: "hidden",
        minHeight: '85%'
    },
});
