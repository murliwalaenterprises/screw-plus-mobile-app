
import { CheckCircle, Package, Truck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

const steps = [
    {
        id: 1,
        title: "Order Placed",
        description: "Your order has been placed successfully.",
        icon: <Package size={28} color="#fff" />,
        eta: "Estimated time: 6 Days",
    },
    {
        id: 2,
        title: "On The Way",
        description: "Our agent is delivering your product.",
        icon: <Truck size={28} color="#fff" />,
        eta: "Estimated time: 3 Days",
    },
    {
        id: 3,
        title: "Product Delivered",
        description: "Your order has been delivered successfully.",
        icon: <CheckCircle size={28} color="#fff" />,
        eta: "Delivered on 20 July, 2017 at 11:00 PM",
    }
];

export default function TrackOrder({ visible, onClose }: any) {
    const { user } = useAuth();
    const [activeStep, setActiveStep] = useState(1);
    const animatedValues = steps.map(() => new Animated.Value(0));

    useEffect(() => {
        steps.forEach((_, index) => {
            Animated.timing(animatedValues[index], {
                toValue: index < activeStep ? 1 : 0,
                duration: 600,
                easing: Easing.ease,
                useNativeDriver: false,
            }).start();
        });
    }, [activeStep]);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

                <Text style={styles.header}>Order Tracking</Text>
                <Text style={styles.orderId}>#825791537</Text>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>

                    {steps.map((step, index) => {
                        const progress = animatedValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ["#ddd", Colors.light.success], // gray → purple
                        });

                        return (
                            <View key={step.id} style={styles.stepContainer}>
                                {/* Circle */}
                                <Animated.View style={[styles.iconWrapper, { backgroundColor: progress }]}>
                                    {step.icon}
                                </Animated.View>

                                {/* Line */}
                                {index !== steps.length - 1 && (
                                    <Animated.View
                                        style={[
                                            styles.line,
                                            {
                                                backgroundColor: animatedValues[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ["#ddd", Colors.light.success],
                                                }),
                                            },
                                        ]}
                                    />
                                )}

                                {/* Text */}
                                <View style={styles.textWrapper}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepDesc}>{step.description}</Text>
                                    <Text style={styles.stepEta}>{step.eta}</Text>
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ color: '#333' }}>Help Line: +91-8440077147</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100

    },
    header: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginTop: 20,
        marginBottom: 5,
        color: "#333",
    },
    orderId: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 10,
        color: "#888",
    },
    stepContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 40,
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    line: {
        position: "absolute",
        top: 50,
        left: 25 - 1,
        width: 2,
        height: 60,
    },
    textWrapper: {
        marginLeft: 20,
        flex: 1,
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    stepDesc: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    stepEta: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
});
