
import { CheckCircle, ChevronDown, CreditCard, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderItem } from '../../types/types';
import { formatTimestampDate, generateOrderId, getEstimatedDeliveryDate, paymentMethods } from '../../services/utilityService';
import { firebaseService } from '../../services/firebaseService';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import LocationSelector from '../../components/LocationSelector';
import OrderSuccess from './OrderSuccess';
import { StackNames } from '../../constants/stackNames';
import { startRazorpayPayment } from '../../services/paymentService';
// import { sendOrderNotification } from '../../services/notificationService';

export default function CheckoutScreen({ navigation }: any) {

    const { cart, getCartTotal, clearCart } = useStore();
    const { user }: any = useAuth();
    const userId = user?.uid;
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNotes, setOrderNotes] = useState('');
    const [locations, setLocations] = useState<{ id: string, label: string }[]>([]);

    const { selectedLocation } = useAuth();
    const [showLocationSelector, setShowLocationSelector] = useState(false);
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    const [orderDetails, setOrderDetails] = React.useState<any>({});

    const cartTotal = getCartTotal();
    const deliveryFee = 50;
    const taxPercentage = 18;
    const platformFee = 20;
    const tax = Math.round(cartTotal * (taxPercentage / 100));
    const finalTotal = cartTotal + deliveryFee + tax + platformFee;

    // const addresses = [
    //     '123 Main Street, New Delhi, 110001',
    //     '456 Park Avenue, Mumbai, 400001',
    //     '789 Garden Road, Bangalore, 560001'
    // ];

    const handleRazorpayPayment = async () => {
        try {
            const orderDetails = {
                orderId: 'order_' + Date.now(),
                Amount: finalTotal.toString(),
                EmailId: '', // Collect from user input
                MobileNo: '', // Collect from user input
                CustomerName: 'Pradeep Suthar', // Collect from user input
                CustomerEmail: 'sutharpradeep081@gmail.com',
                CustomerMobile: '8440077147',
                CompanyName: 'Screw Plus', // Collect from user input
                CompanyLogo: 'https://example.com/logo.png', // Your company logo
                Description: 'Order Payment',
                MTxnId: `MT${Date.now()}`, // Unique transaction ID
            };
            const options = {
                key: 'rzp_test_cURWUv0ns0gAYU', // Replace with your Razorpay key
                amount: finalTotal * 100, // Amount in paise
                currency: 'INR',
                name: orderDetails.CompanyName,
                description: orderDetails.Description,
                image: orderDetails.CompanyLogo, // Your app logo
                order_id: orderDetails.orderId, // Unique order ID
                prefill: {
                    name: orderDetails.CustomerName,
                    email: orderDetails.CustomerEmail,
                    contact: orderDetails.CustomerMobile,
                },
                theme: { color: Colors.light.primaryButtonBackground.end },
            };
            startRazorpayPayment({
                amount: options.amount,
                orderId: orderDetails.orderId, // Collect Order ID from Backend
                email: orderDetails.EmailId,
                contact: orderDetails?.MobileNo,
                name: orderDetails?.CustomerName,
                companyName: orderDetails.CompanyName,
                key: options.key,
                description: orderDetails?.Description,
                transactionId: orderDetails?.MTxnId,  // Collect Transaction ID from Backend
                onSuccess: async (data) => {
                    console.log('Payment Success:', data);
                    if (data.razorpay_payment_id && data.razorpay_signature && data.razorpay_order_id) {
                        const resPayload = {
                            'razorpay_signature': data.razorpay_signature,
                            'razorpay_payment_id': data.razorpay_payment_id,
                            'razorpay_order_id': data.razorpay_order_id,
                            'razorpay_mobile': options.prefill.contact,
                            'razorpay_email': options.prefill.email,
                        };
                        console.log('resPayload', resPayload);
                        Alert.alert(
                            'Order Placed Successfully!',
                            `Your order has been placed successfully. Order total: ₹${finalTotal.toLocaleString()}`,
                            [
                                {
                                    text: 'View Orders',
                                    onPress: () => navigation.navigate(StackNames.Orders)
                                },
                                {
                                    text: 'Continue Shopping',
                                    onPress: () => navigation.navigate(StackNames.MainAppStack)
                                }
                            ]
                        );
                    }
                },
                onError: (error) => {
                    console.log('Payment Error:', error);
                },
            });
        } catch (error) {
            console.error('Razorpay Payment Error:', error);
            Alert.alert('Payment Error', 'An error occurred while initiating payment. Please try again.');
        }
    };

    const handlePlaceOrder = async () => {
        if (!getSelectedLocation(selectedLocation)) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        if (!selectedPayment) {
            Alert.alert('Error', 'Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            const items: OrderItem[] = cart.map(item => {
                const productVariant = item.product.variants.find(
                    variant => variant.size === item.selectedSize && variant.color === item.selectedColor
                );

                return {
                    productId: item.product.id,
                    name: item.product.title,
                    description: item.product.description,
                    brand: item.product.brand,
                    category: item.product.category,
                    image: item.product.image,
                    size: productVariant?.size,
                    color: productVariant?.color,
                    price: productVariant?.price ?? 0,
                    quantity: item.quantity,
                    total: Number(productVariant?.price ?? 0) * item.quantity
                };
            });

            const order: Order = {
                orderId: generateOrderId(),
                items: items,
                invoiceNo: null,
                status: 'pending' as const,
                isPaid: false,
                deliveryAddress: getSelectedLocation(selectedLocation),
                paymentMethod: selectedPayment,
                subTotal: cartTotal,
                deliveryFee,
                estimatedDelivery: getEstimatedDeliveryDate(new Date(), 'standard'),
                taxPercentage,
                taxAmount: tax,
                platformFee,
                discount: 0,
                finalTotal,
                notes: orderNotes,
                orderDate: new Date()
            };

            // call handleRazorPay function if selected payment is online
            // if payment is done by razorpay then place order

            console.log('order', JSON.stringify(order, null, 2));
            setOrderDetails(order);
            await firebaseService.addOrder(userId, order);
            Vibration.vibrate(500);
            clearCart();
            setIsOrderPlaced(true);
            // Send push notification
            // await sendOrderNotification('pending', `CS${Date.now()}`);
            Alert.alert(
                'Order Placed Successfully!',
                `Your order has been placed successfully. Order total: ₹${finalTotal.toLocaleString()}`,
                [
                    {
                        text: 'View Orders',
                        onPress: () => navigation.navigate(StackNames.Orders)
                    },
                    {
                        text: 'Continue Shopping',
                        onPress: () => navigation.navigate(StackNames.MainAppStack)
                    }
                ]
            );
        } catch {
            Alert.alert('Error', 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };


    React.useEffect(() => {
        if (isOrderPlaced) {
            navigation.setOptions({
                title: "Order Confirmation",
                headerBackVisible: false, // ✅ hides the back button
                gestureEnabled: false,    // ✅ disables swipe back on iOS
            });
        } else {
            navigation.setOptions({
                title: "Checkout",
                headerBackVisible: true,
                gestureEnabled: true,
            });
        }
    }, [isOrderPlaced]);

    if (isOrderPlaced) {
        return (
            <OrderSuccess
                order={{
                    id: orderDetails.orderId,
                    date: `${formatTimestampDate(orderDetails.orderDate)}`,
                    amount: orderDetails.finalTotal,
                    status: orderDetails.status,
                }}
            />
        );
    }

    if (cart.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['left', 'right']}>
                <View style={styles.container}>
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <TouchableOpacity
                            style={styles.shopButton}
                            onPress={() => navigation.navigate(StackNames.MainAppStack)}
                        >
                            <Text style={styles.shopButtonText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const getSelectedLocation = (locId: string) => {
        const loc = locations.find(location => location.id === locId);
        if (loc) {
            return loc.label;
        }
        return 'Select Location';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['left', 'right']}>
            <View style={styles.container}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>
                    {/* Order Summary */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Summary</Text>
                        {cart.map((item, index) => {

                            const selectedVariant: any = item.product.variants.find(product => product.size === item.selectedSize && product.color === item.selectedColor);

                            return (
                                <View key={index} style={styles.orderItem}>
                                    <View style={styles.orderItemInfo}>
                                        <Text style={styles.orderItemName}>{item.product.title}</Text>
                                        <Text style={styles.orderItemDetails}>
                                            Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                                        </Text>
                                    </View>
                                    <Text style={styles.orderItemPrice}>₹{(selectedVariant.price * item.quantity).toLocaleString()}</Text>
                                </View>
                            )
                        })}
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={20} color={Colors.light.primaryButtonBackground.end} />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.addressOption, { justifyContent: 'space-between' }]}
                            onPress={() => setShowLocationSelector(true)}
                        >
                            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">{getSelectedLocation(selectedLocation)}</Text>
                            <ChevronDown size={16} color="#333" />
                        </TouchableOpacity>

                        {/* {addresses.map((address, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.addressOption,
                                    selectedAddress === address && styles.selectedOption
                                ]}
                                onPress={() => setSelectedAddress(address)}
                            >
                                <View style={styles.radioButton}>
                                    {selectedAddress === address && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.addressText}>{address}</Text>
                            </TouchableOpacity>
                        ))} */}
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <CreditCard size={20} color={Colors.light.primaryButtonBackground.end} />
                            <Text style={styles.sectionTitle}>Payment Method</Text>
                        </View>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={[
                                    styles.paymentOption,
                                    selectedPayment === method.id && styles.selectedOption
                                ]}
                                onPress={() => setSelectedPayment(method.id)}
                            >
                                <View style={styles.radioButton}>
                                    {selectedPayment === method.id && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.paymentIcon}>{method.icon}</Text>
                                <Text style={styles.paymentText}>{method.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Order Notes */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Add any special instructions..."
                            value={orderNotes}
                            onChangeText={setOrderNotes}
                            multiline
                            placeholderTextColor={Colors.light.placeholderTextColor}
                            numberOfLines={3}
                        />
                    </View>

                    {/* Price Breakdown */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Price Details</Text>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Subtotal</Text>
                            <Text style={styles.priceValue}>₹{cartTotal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Delivery Fee</Text>
                            <Text style={styles.priceValue}>₹{deliveryFee}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tax ({taxPercentage}%)</Text>
                            <Text style={styles.priceValue}>₹{tax.toLocaleString()}</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Platform Fee</Text>
                            <Text style={styles.priceValue}>₹{platformFee.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{finalTotal.toLocaleString()}</Text>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handlePlaceOrder}
                        disabled={isProcessing}
                    >
                        <LinearGradient
                            colors={[Colors.light.primaryButtonBackground.start, Colors.light.primaryButtonBackground.end]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={[styles.placeOrderButton, isProcessing && styles.disabledButton]}>
                                <CheckCircle size={20} color={Colors.light.primaryButtonForeground} />
                                <Text style={styles.placeOrderText}>
                                    {isProcessing ? 'Processing...' : `Place Order • ₹${finalTotal.toLocaleString()}`}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <LocationSelector
                visible={showLocationSelector}
                onClose={() => setShowLocationSelector(false)}
                getLocations={setLocations}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    orderItemInfo: {
        flex: 0.9,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    orderItemDetails: {
        fontSize: 12,
        color: '#666',
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    addressOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
    },
    selectedOption: {
        backgroundColor: '#e8f2ff',
        borderWidth: 1,
        borderColor: Colors.light.primaryButtonBackground.end,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.primaryButtonBackground.end,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    paymentIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    paymentText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        textAlignVertical: 'top',
        marginTop: 8,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: '#666',
    },
    priceValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        marginTop: 8,
        paddingTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.primaryButtonBackground.end,
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    placeOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: '#333',
        paddingVertical: 16,
        borderRadius: 12,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    placeOrderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.light.primaryButtonForeground,
        marginLeft: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 24,
    },
    shopButton: {
        backgroundColor: '#333',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    locationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginHorizontal: 6,
        maxWidth: '90%',
    },
});