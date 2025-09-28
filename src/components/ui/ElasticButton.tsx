/* eslint-disable react-native/no-inline-styles */
import React, { useRef } from "react";
import { Animated, PanResponder, StyleSheet, View } from "react-native";
import { X } from "lucide-react-native";
import { moderateScale } from "react-native-size-matters";
import { BlurView } from "@react-native-community/blur";

const ElasticButton = ({ isDisabled = false, isDark = true, icon, onPress }: { isDisabled?: boolean, isDark?: boolean, icon?: React.ReactNode, onPress: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                // Slight scale up on press
                Animated.spring(scale, { toValue: 1.1, friction: 3, useNativeDriver: true }).start();
            },
            onPanResponderMove: (evt, gestureState) => {
                // Non-linear stretch for rubber effect
                translateX.setValue(Math.sign(gestureState.dx) * Math.sqrt(Math.abs(gestureState.dx)) * 2);
                translateY.setValue(Math.sign(gestureState.dy) * Math.sqrt(Math.abs(gestureState.dy)) * 2);
            },
            onPanResponderRelease: (evt, gestureState) => {
                // Bounce back
                Animated.parallel([
                    Animated.spring(scale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
                    Animated.spring(translateX, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
                    Animated.spring(translateY, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
                ]).start();

                // Trigger press only for tap
                if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
                    onPress();
                }
            },
            onPanResponderTerminate: () => {
                Animated.parallel([
                    Animated.spring(scale, { toValue: 1, friction: 4, tension: 150, useNativeDriver: true }),
                    Animated.spring(translateX, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
                    Animated.spring(translateY, { toValue: 0, friction: 4, tension: 150, useNativeDriver: true }),
                ]).start();
            },
        })
    ).current;

    return (
        <Animated.View
            {...(!isDisabled ? panResponder.panHandlers : {})}
            style={{ transform: [{ scale }, { translateX }, { translateY }] }}
        >
            {/* Outer wrapper for shadow */}
            <View
                style={{
                    borderRadius: 100,
                    shadowColor: '#8b8b8bff',
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 5, // Android shadow
                }}
            >
                <View style={{ borderRadius: 100, overflow: 'hidden' }}>
                    <BlurView
                        blurType={!isDark ? "dark" : "light"}
                        blurAmount={1}
                    >
                        <View style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : "rgba(0,0,0,0.3)", opacity: isDisabled ? 0.2 : 1 }]}>
                            {icon ? icon : (<X size={moderateScale(16)} color={isDark ? '#222' : '#fff'} />)}
                        </View>
                    </BlurView>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        borderRadius: 100,
        padding: moderateScale(10),
        borderWidth: 0.3,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",

    },
});

export default ElasticButton;
