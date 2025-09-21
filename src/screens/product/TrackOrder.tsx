/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import { CheckCircle, Package, Truck, X, Ban, ClipboardList } from 'lucide-react-native';
import React, { JSX, useEffect, useState, useRef } from 'react';
import {
    Animated,
    Easing,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { scale } from 'react-native-size-matters';
import { CustomStyles } from '../../constants/CustomStyles';

export const OrderStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
];

const statusIcons: Record<string, JSX.Element> = {
    pending: <ClipboardList size={28} color="#fff" />,
    processing: <ClipboardList size={28} color="#fff" />,
    confirmed: <Package size={28} color="#fff" />,
    shipped: <Truck size={28} color="#fff" />,
    delivered: <CheckCircle size={28} color="#fff" />,
    cancelled: <Ban size={28} color="#fff" />,
};

export default function TrackOrder({ data, visible, onClose }: any) {
    const animatedValues = useRef(
        OrderStatusOptions.map(() => new Animated.Value(0))
    ).current;

    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const newIndex = OrderStatusOptions.findIndex(s => s.value === data?.status);
        setActiveStep(newIndex >= 0 ? newIndex : 0);
    }, [data?.status]);

    useEffect(() => {
        OrderStatusOptions.forEach((_, index) => {
            Animated.timing(animatedValues[index], {
                toValue: index <= activeStep ? 1 : 0,
                duration: 600,
                easing: Easing.ease,
                useNativeDriver: false,
            }).start();
        });
    }, [activeStep]);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <View />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.header}>Order Tracking</Text>
                        <Text style={styles.orderId}>#{data?.orderNumber}</Text>
                    </View>
                    <TouchableOpacity style={CustomStyles.buttonSmall} onPress={onClose}>
                        <X size={scale(20)} />
                    </TouchableOpacity>
                </View>

                {/* Steps */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                    {OrderStatusOptions.map((step, index) => {
                        if (data?.status === 'cancelled' && step.value !== 'cancelled') return null;

                        const progress = animatedValues[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#ddd', Colors.light.success],
                        });

                        return (
                            <View key={step.value} style={styles.stepContainer}>
                                {/* Circle */}
                                <Animated.View style={[styles.iconWrapper, { backgroundColor: progress }]}>
                                    {statusIcons[step.value]}
                                </Animated.View>

                                {/* Line */}
                                {index !== OrderStatusOptions.length - 1 && (
                                    <Animated.View
                                        style={[
                                            styles.line,
                                            {
                                                backgroundColor: animatedValues[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['#ddd', Colors.light.success],
                                                }),
                                            },
                                        ]}
                                    />
                                )}

                                {/* Text */}
                                <View style={styles.textWrapper}>
                                    <Text style={styles.stepTitle}>{step.label}</Text>
                                    <Text style={styles.stepDesc}>
                                        {step.value === 'pending' && 'Your order is waiting to be processed.'}
                                        {step.value === 'processing' && 'We are preparing your order.'}
                                        {step.value === 'confirmed' && 'Your order has been confirmed.'}
                                        {step.value === 'shipped' && 'Your order is on the way.'}
                                        {step.value === 'delivered' && 'Your order has been delivered.'}
                                    </Text>
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
    container: { flex: 1, backgroundColor: '#fff' },
    content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(20),
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 5,
        color: '#333',
    },
    orderId: { fontSize: 14, textAlign: 'center', marginBottom: 10, color: '#888' },
    stepContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 40 },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    line: { position: 'absolute', top: 50, left: 24, width: 2, height: 60 },
    textWrapper: { marginLeft: 20, flex: 1 },
    stepTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
    stepDesc: { fontSize: 14, color: '#666', marginTop: 4 },
});
