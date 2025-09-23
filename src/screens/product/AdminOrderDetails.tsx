/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */

import {
    Check,
    CheckCircle,
    Clock,
    Download,
    Package,
    Truck,
    XCircle
} from 'lucide-react-native';
import React from "react";
import {
    Alert,
    Animated,
    Image,
    Linking,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { getStatusColor, paymentMethods, formatCurrency } from '../../services/utilityService';
import { StackNames } from '../../constants/StackNames';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebaseService } from '../../services/firebaseService';
import { AppText, Select } from '../../components/ui';
import { OrderStatusOptions } from '../../constants/Constant';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../constants/Colors';
import { sendOrderNotification } from '../../services/notificationService';

type OrderItem = {
    id: string;
    productId: string;
    name: string;
    size: string;
    color: string;
    image: string;
    price: number;
    quantity: number;
};

const StatusSequence = [
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
];

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending':
            return <Clock size={16} color="#ffa502" />;
        case 'processing':
            return <Package size={16} color="#3742fa" />;
        case 'shipped':
            return <Truck size={16} color="#2f3542" />;
        case 'delivered':
            return <CheckCircle size={16} color="#2ed573" />;
        case 'confirmed':
            return <Check size={16} color="#2ed573" />;
        case 'cancelled':
            return <XCircle size={16} color="#ff4757" />;
        default:
            return <Clock size={16} color="#ffa502" />;
    }
};

export default function AdminOrderDetailsScreen({ navigation, route }: any) {

    const invoiceUri = 'https://www.wmaccess.com/downloads/sample-invoice.pdf';
    const scrollY = React.useRef(new Animated.Value(0)).current;

    // ✅ unwrap the order object from route.params
    const orderData = route.params?.order || {};
    const [order, setOrder] = React.useState<any>(orderData);
    console.log("Order details:", order);

    React.useEffect(() => {
        if (route.params?.order?.userId) {
            firebaseService.subscribeToUser(route.params.order.userId, (userData) => {
                if (userData) {
                    console.log("User data:", userData);
                    setOrder((prevOrder: any) => ({
                        ...prevOrder,
                        customerName: userData.displayName,
                        customerEmail: userData.email,
                        customerPhone: userData.phoneNumber,
                        customerGender: userData.gender
                    }));
                }
            });
        }
    }, [route.params?.order]);


    const handleDialPress = () => {
        let phoneNumber = order?.customerPhone;

        if (!phoneNumber) {
            Alert.alert('Error', 'Phone number is not available');
            return;
        }

        // Sanitize the phone number (remove spaces, dashes, etc.)
        const sanitizedNumber = phoneNumber.replace(/[^0-9]/g, '');

        let url = `tel:${sanitizedNumber}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    Alert.alert('Error', 'Phone number is not available');
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch(() => {
                Alert.alert('Error', 'An error occurred while trying to make the call');
            });
    };

    // ✅ extract items safely
    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <ScreenHeader
                title={StackNames.AdminOrderDetailsScreen}
                navigation={navigation}
            />
            <View style={styles.container}>
                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    style={{ padding: 20, backgroundColor: '#fff' }}
                    contentContainerStyle={{ paddingBottom: 80 }}
                >
                    {/* Status */}
                    <View style={styles.statusBox}>
                        <View style={styles.statusContainer}>
                            {getStatusIcon(order.status)}
                            <AppText
                                style={[
                                    styles.statusText,
                                    { color: getStatusColor(order.status), marginBottom: 0 }
                                ]}
                            >
                                {order.status
                                    ? order?.status?.charAt(0)?.toUpperCase() + order?.status?.slice(1)
                                    : ""}
                            </AppText>
                        </View>
                        <AppText style={styles.deliveryText}>
                            Estimated Delivery by {order.estimatedDelivery}
                        </AppText>
                    </View>


                    <View style={[styles.section, { marginBottom: 5 }]}>
                        <AppText style={styles.sectionTitle}>ORDER DETAILS</AppText>
                    </View>

                    {/* Order Info */}
                    <View style={styles.orderInfo}>
                        {/* <View style={styles.row}>
                            <Text style={styles.label}>Order #ID</Text>
                            <Text style={styles.value}>{order.orderId}</Text>
                        </View> */}
                        <View style={styles.row}>
                            <AppText style={styles.label}>Order Number</AppText>
                            <AppText style={styles.value}>{order.orderNumber || 'NA'}</AppText>
                        </View>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Placed on</AppText>
                            <AppText style={styles.value}>{order.placedOn}</AppText>
                        </View>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Payment Method</AppText>
                            <AppText style={styles.value}>
                                {paymentMethods.find(mode => mode.id === order.paymentMethod)?.name}
                            </AppText>
                        </View>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Total</AppText>
                            <AppText style={styles.value}>
                                {formatCurrency(order?.total)}
                            </AppText>
                        </View>
                    </View>

                    {/* Customer Details */}
                    <View style={[styles.section, { marginBottom: 5 }]}>
                        <AppText style={styles.sectionTitle}>CUSTOMER DETAILS</AppText>
                    </View>

                    {/* Customer Info */}
                    <View style={styles.orderInfo}>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Name</AppText>
                            <AppText style={styles.value}>{order.customerName}</AppText>
                        </View>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Email</AppText>
                            <AppText style={styles.value}>{order.customerEmail}</AppText>
                        </View>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Contact No</AppText>
                            <TouchableOpacity onPress={handleDialPress}>
                                <AppText style={styles.value}>{order.customerPhone}</AppText>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <AppText style={styles.label}>Gender</AppText>
                            <AppText style={styles.value}>{order?.customerGender?.charAt(0)?.toUpperCase() + order?.customerGender?.slice(1)}</AppText>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>SHIPPING ADDRESS</AppText>
                        <AppText style={styles.sectionText}>{order.deliveryAddress}</AppText>
                    </View>

                    {/* Items */}
                    {items.map((item, index) => (
                        <View key={item.productId + '-' + index} style={styles.itemCard}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={{ flex: 1, marginRight: 20 }}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate(StackNames.ProductDetails, { productId: item.productId })}
                                >
                                    <AppText
                                        style={styles.itemName}
                                        numberOfLines={2}
                                        ellipsizeMode='tail'
                                    >
                                        {item.name}
                                    </AppText>
                                </TouchableOpacity>
                                <AppText style={styles.itemVariant}>
                                    {item.size} • {item.color}
                                </AppText>
                                <AppText style={styles.itemPrice}>
                                    {formatCurrency(item.price)}
                                </AppText>
                            </View>
                            <AppText style={styles.itemQty}>Qty: {item.quantity}</AppText>
                        </View>
                    ))}



                    {/* Order Summary */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>ORDER SUMMARY</AppText>
                        <View style={[styles.orderInfo, { padding: 0, backgroundColor: 'transparent', marginTop: 5 }]}>
                            <View style={styles.row}>
                                <AppText style={styles.label}>Item(s) Subtotal:</AppText>
                                <AppText style={styles.value}>
                                    {formatCurrency(order?.subTotal)}
                                </AppText>
                            </View>
                            <View style={styles.row}>
                                <AppText style={styles.label}>Tax ({order.taxPercentage || 0}%):</AppText>
                                <AppText style={styles.value}>
                                    {formatCurrency(order?.taxAmount)}
                                </AppText>
                            </View>
                            <View style={styles.row}>
                                <AppText style={styles.label}>Shipping:</AppText>
                                <AppText style={styles.value}>
                                    {formatCurrency(order?.deliveryFee)}
                                </AppText>
                            </View>
                            <View style={styles.row}>
                                <AppText style={styles.label}>Platform Fee:</AppText>
                                <AppText style={styles.value}>
                                    {formatCurrency(order?.platformFee)}
                                </AppText>
                            </View>
                            <View style={styles.row}>
                                <AppText style={styles.label}>Discount:</AppText>
                                <AppText style={styles.value}>
                                    {formatCurrency(order?.discount)}
                                </AppText>
                            </View>
                            <View style={styles.row}>
                                <AppText style={[styles.label, { fontWeight: '600', color: '#000' }]}>
                                    Grand Total:
                                </AppText>
                                <AppText style={styles.value}>
                                    {formatCurrency(order?.total)}
                                </AppText>
                            </View>
                        </View>
                    </View>

                    {/* {UPDATE STATUS} */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>ORDER STATUS</AppText>
                        <Select
                            label="Update Order Status"
                            options={OrderStatusOptions
                                .filter(opt => opt.value !== 'processing')
                                .map(opt => {
                                    const currentIndex = StatusSequence?.indexOf(order.status);
                                    const optionIndex = StatusSequence?.indexOf(opt.value);
                                    return {
                                        ...opt,
                                        disabled: optionIndex < currentIndex,
                                    };
                                })}
                            value={order.status}
                            onChange={(value) => {
                                const updatedStatus: any = value;
                                console.log("Selected status:", updatedStatus);
                                if (updatedStatus) {
                                    firebaseService.updateOrder(order?.userId, order?.id, { status: updatedStatus })
                                        .then(() => {
                                            setOrder((prevOrder: any) => ({
                                                ...prevOrder,
                                                status: updatedStatus
                                            }));
                                            // sendOrderNotification(updatedStatus, order?.orderNumber);
                                            Alert.alert('Success', 'Order status updated successfully');
                                        })
                                        .catch((error) => {
                                            console.error("Error updating order status:", error);
                                            Alert.alert('Error', 'Failed to update order status');
                                        });
                                }
                            }}
                        />
                    </View>

                </Animated.ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    {/* <TouchableOpacity style={styles.addToCartButton}>
                        <Headphones size={20} color="#333" />
                        <Text style={styles.addToCartText}>Support</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={styles.buyNowButton}
                        onPress={() => {
                            navigation.navigate("PdfPreview", {
                                invoiceNo: order?.orderId || "WMACCESS",
                                invoiceUri: invoiceUri, // pass your PDF link here
                            });
                        }}
                    >
                        <Download size={20} color="#fff" />
                        <AppText style={styles.buyNowText}>Invoice</AppText>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.StatusBarBg },
    cartButton: {
        backgroundColor: "#ffe6e6",
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
        marginBottom: 4,
    },
    cartButtonText: { color: "red", fontWeight: "600" },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 5
    },
    subText: { textAlign: "center", color: "#666", marginBottom: 16 },
    orderInfo: {
        backgroundColor: "#F2F2F2",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { color: "#555" },
    value: { fontWeight: "600", color: "#0f1111" },
    statusBox: {
        backgroundColor: "#F2F2F2",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    statusText: { color: "red", fontWeight: "700", marginBottom: 4 },
    deliveryText: { color: "#555" },
    itemCard: {
        flexDirection: "row",
        justifyContent: 'space-between',
        gap: 10,
        backgroundColor: "#fefefe",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    itemImage: { width: 60, height: 60, borderRadius: 6, backgroundColor: '#fff' },
    itemName: { fontWeight: "600", color: '#2162a1' },
    itemPrice: { color: "#333", fontWeight: '600' },
    itemVariant: {
        color: '#575959',
        marginVertical: 5
    },
    itemQty: { fontWeight: "600", color: "#0f1111" },
    section: { marginBottom: 28, paddingHorizontal: 10 },
    sectionTitle: { fontWeight: "700", marginBottom: 6, color: "#444" },
    sectionText: { color: "#555" },

    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 10
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    addToCartText: {
        color: '#333',
        fontWeight: '500',
        marginLeft: 8,
    },
    buyNowButton: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#333',
        gap: 8
    },
    buyNowText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});


