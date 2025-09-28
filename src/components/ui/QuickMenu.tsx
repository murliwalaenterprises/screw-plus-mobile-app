/* eslint-disable react-native/no-inline-styles */
import {
    Animated,
    findNodeHandle,
    GestureResponderEvent,
    Modal,
    PanResponder,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import React, { useRef, useState } from "react";
import { moderateScale, moderateVerticalScale, scale } from "react-native-size-matters";
import { BlurView } from "@react-native-community/blur";
import { MoreHorizontal } from "lucide-react-native";
import ElasticButton from "./ElasticButton";

type MenuOption = {
    label: string;
    isActive?: boolean;
    icon: React.ReactNode;
    onPress: () => void;
    textColor?: string; // optional, default black
};

type QuickMenuProps = {
    icon?: React.ReactNode;
    options: MenuOption[];
};


const QuickMenu: React.FC<QuickMenuProps> = ({ icon, options }) => {
    const buttonRef = useRef<any>(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [hoverAnim] = useState(() => options.map(() => new Animated.Value(0)));
    const [buttonScale] = useState(() => new Animated.Value(1));

    const menuWidth = 240;
    const menuHeight = options.length - 40;

    // PanResponder for hover effect during long press
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt: GestureResponderEvent) => {
                handleHover(evt.nativeEvent);
            },
            onPanResponderMove: (evt: GestureResponderEvent) => {
                handleHover(evt.nativeEvent);
            },
            onPanResponderRelease: () => {
                if (activeIndex !== null) {
                    options[activeIndex].onPress(); // call the active item's callback
                }
                setActiveIndex(null);
                closeMenu(); // close the menu
            },
            onPanResponderTerminate: () => {
                setActiveIndex(null);
                closeMenu(); // close the menu if gesture is interrupted
            },
        })
    ).current;

    // handleHover stays same
    const handleHover = (nativeEvent: any) => {
        const { locationY } = nativeEvent;
        let cumulativeHeight = 0;
        for (let i = 0; i < options.length; i++) {
            const itemHeight = 40;
            cumulativeHeight += itemHeight;

            // animate previous hover out
            hoverAnim.forEach((anim, idx) => {
                Animated.timing(anim, {
                    toValue: idx === i ? 1 : 0,
                    duration: 150,
                    useNativeDriver: false,
                }).start();
            });

            if (locationY <= cumulativeHeight) {
                setActiveIndex(i);
                break;
            }
        }
    };

    // inside openMenu
    const openMenu = () => {
        if (!buttonRef.current) return;

        hoverAnim.forEach(anim => anim.setValue(0));
        setActiveIndex(null);

        const nodeHandle = findNodeHandle(buttonRef.current);
        if (nodeHandle != null) {
            UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
                // menu will appear at button center

                const originX = pageX + width / 2 - menuWidth / 2;
                const originY = pageY + height / 2 - menuHeight / 2;

                setMenuPos({ x: originX, y: originY });
                setMenuVisible(true);

                // start scale from 0 at click point
                scaleAnim.setValue(0.3);
                opacityAnim.setValue(0);

                Animated.parallel([
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 5,
                        tension: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]).start();
            });
        }
    };

    const closeMenu = () => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.5,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => setMenuVisible(false));
    };

    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
            Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    return (
        <View>
            <TouchableOpacity ref={buttonRef}>
                <Animated.View style={[{ transform: [{ scale: buttonScale }] }]}>
                    <ElasticButton icon={icon ? icon : (<MoreHorizontal size={scale(14)} color="#4B5563" />)} onPress={() => {
                        animateButtonPress();
                        openMenu();
                    }} />
                </Animated.View>
            </TouchableOpacity>

            {/* Action Menu */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="none"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                top: menuPos.y - 38,
                                left: menuPos.x - 60,
                                opacity: opacityAnim,
                                transform: [
                                    { translateX: menuWidth / 2 },   // center origin
                                    { translateY: menuHeight / 2 },
                                    { scale: scaleAnim },
                                    { translateX: -menuWidth / 2 },
                                    { translateY: -menuHeight / 2 },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.shadowWrapper}>
                            <View style={styles.menuContainer} {...panResponder.panHandlers}>
                                <BlurView
                                    style={StyleSheet.absoluteFill}
                                    blurType="light"
                                    blurAmount={5}
                                    reducedTransparencyFallbackColor="white"
                                />

                                {options.map((opt, idx) => {
                                    const isHovered = hoverAnim[idx]; // Animated value for hover
                                    const bgColor = isHovered.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['transparent', 'rgba(0,0,0,0.04)'],
                                    });

                                    // Active style color
                                    const activeBgColor = opt.isActive ? 'rgba(0,0,0,0.04)' : '';

                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            activeOpacity={1}
                                            onPress={async () => {
                                                await closeMenu();
                                                setTimeout(() => {
                                                    opt.onPress();
                                                }, 200);
                                            }}
                                            onPressIn={() => {
                                                Animated.timing(hoverAnim[idx], {
                                                    toValue: 1,
                                                    duration: 100,
                                                    useNativeDriver: false,
                                                }).start();
                                            }}
                                            onPressOut={() => {
                                                Animated.timing(hoverAnim[idx], {
                                                    toValue: 0,
                                                    duration: 100,
                                                    useNativeDriver: false,
                                                }).start();
                                            }}
                                        >
                                            <Animated.View
                                                style={[
                                                    styles.menuItem,
                                                    {
                                                        borderRadius: 20,
                                                        backgroundColor: opt.isActive
                                                            ? activeBgColor
                                                            : bgColor,
                                                    },
                                                ]}
                                            >
                                                {opt.icon}
                                                <Text
                                                    style={[
                                                        styles.menuText,
                                                        { marginLeft: opt.icon ? 12 : 0 },
                                                    ]}
                                                >
                                                    {opt.label}
                                                </Text>
                                            </Animated.View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default QuickMenu;

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0)" },
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
    menuContainer: {
        backgroundColor: "rgba(255,255,255,0.2)", // semi-transparent
        borderRadius: 16,
        overflow: "hidden", // blur effect
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.8)",    // subtle white border
        paddingVertical: 8,
        paddingHorizontal: 10
    },
    menuItem: {
        flexDirection: "row",
        justifyContent: "flex-start",
        paddingVertical: moderateVerticalScale(5),
        paddingHorizontal: moderateScale(22),
    },
    menuText: { fontSize: scale(13), color: "#1F2937" },

    defaultButton: {
        backgroundColor: "rgba(255,255,255,0.5)",
        borderRadius: 100,
        paddingVertical: scale(6),
        paddingHorizontal: scale(6),
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
