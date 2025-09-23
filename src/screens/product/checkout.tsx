/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */

import { CheckCircle, ChevronDown, CreditCard, MapPin, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderItem } from '../../types/types';
import { formatCurrency, formatTimestampDate, generateOrderId, generateOrderNumber, getEstimatedDeliveryDate, paymentMethods } from '../../services/utilityService';
import { firebaseService } from '../../services/firebaseService';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import LocationSelector from '../../components/LocationSelector';
import OrderSuccess from './OrderSuccess';
import { StackNames } from '../../constants/StackNames';
import { startRazorpayPayment } from '../../services/paymentService';
import ScreenHeader from '../../components/ScreenHeader';
import { moderateScale } from 'react-native-size-matters';
import { AppText } from '../../components/ui';
// import { sendOrderNotification } from '../../services/notificationService';

export default function CheckoutScreen({ navigation }: any) {

    const { cart, getCartTotal, clearCart } = useStore();
    const { user, userProfile }: any = useAuth();
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderNotes, setOrderNotes] = useState('');
    const [locations, setLocations] = useState<{ id: string, label: string }[]>([]);

    const { selectedLocation } = useAuth();
    const [showLocationSelector, setShowLocationSelector] = useState(false);
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [loadingSuccess, setLoadingSuccess] = useState(false);

    const [orderDetails, setOrderDetails] = React.useState<any>({});

    const cartTotal = getCartTotal();
    const deliveryFee = 50;
    const taxPercentage = 18;
    const platformFee = 20;
    const tax = Math.round(cartTotal * (taxPercentage / 100));
    const finalTotal = cartTotal + deliveryFee + tax + platformFee;

    const handleOrderConfirmation = async (order: any) => {
        const userId = user?.uid || userProfile?.uid;
        if (!userId) {
            Alert.alert('Error', 'User not logged in');
            return;
        }

        setOrderDetails(order);

        try {
            setLoadingSuccess(true);
            await firebaseService.addOrder(userId, order);
            console.log("Order added to Firebase successfully");
            Vibration.vibrate(500);
            clearCart();
            setIsOrderPlaced(true);
        } catch (err) {
            console.error("Error adding order:", err);
            Alert.alert("Error", "Failed to place your order.");
        } finally {
            setLoadingSuccess(false);
        }
    };

    const handleRazorpayPayment = async (order: Order) => {
        try {
            let oOrderDetails = {
                ...order,
                orderId: order.orderId || '',
                finalTotal: finalTotal,
                CustomerName: userProfile?.displayName || '',
                CustomerEmail: userProfile?.email || '',
                CustomerMobile: userProfile?.phoneNumber || '',
                CompanyName: userProfile?.companyName || '',
                CompanyLogo: userProfile?.companyLogo || null,
                Description: userProfile?.Description || 'Order Payment',
                MTxnId: `MT${Date.now()}`,
                orderDate: new Date().toISOString(),
                status: 'pending',
                paymentId: ''
            };
            const options = {
                amount: finalTotal * 100, // Amount in paise
                name: oOrderDetails.CompanyName,
                image: oOrderDetails.CompanyLogo, // Your app logo
                order_id: oOrderDetails.orderId, // Unique order ID
                prefill: {
                    name: (oOrderDetails.CustomerName || '') + ` ${Date.now()}`,
                    email: oOrderDetails.CustomerEmail || '',
                    contact: oOrderDetails.CustomerMobile || '',
                },
            };
            console.log('Razorpay Options:', options);
            startRazorpayPayment({
                amount: options.amount,
                orderId: oOrderDetails.orderId, // Collect Order ID from Backend
                email: oOrderDetails.CustomerEmail,
                contact: oOrderDetails?.CustomerMobile,
                name: oOrderDetails?.CustomerName,
                companyName: oOrderDetails.CompanyName,
                transactionId: oOrderDetails?.MTxnId,  // Collect Transaction ID from Backend
                onSuccess: async (data) => {
                    if (data.razorpay_payment_id && data.razorpay_signature && data.razorpay_order_id) {
                        const resPayload = {
                            'razorpay_signature': data.razorpay_signature,
                            'razorpay_payment_id': data.razorpay_payment_id,
                            'razorpay_order_id': data.razorpay_order_id,
                            'razorpay_mobile': options.prefill.contact,
                            'razorpay_email': options.prefill.email,
                        };
                        oOrderDetails.paymentId = resPayload.razorpay_payment_id;
                        handleOrderConfirmation(oOrderDetails);
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
        console.log('selectedLocation', selectedLocation);
        if (!selectedLocation) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        if (!selectedPayment) {
            Alert.alert('Error', 'Please select a payment method');
            return;
        }

        setIsProcessing(true);

        try {
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
                    total: Number(productVariant?.price ?? 0) * item.quantity,
                };
            });


            const order: Order = {
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
                orderDate: new Date(),
                orderNumber: generateOrderNumber(),
            };

            if (selectedPayment !== 'cod') {
                const { orderId: razorpayOrderId, receiptId } = await generateOrderId(finalTotal);
                order.orderId = razorpayOrderId;
                order.receiptId = receiptId;
                console.log('Generated Razorpay Order ID:', razorpayOrderId);
                await handleRazorpayPayment(order);
                return;
            }
            else {
                order.orderId = `order_${Date.now()}`;
                order.receiptId = `rcpt_${Date.now()}`;
                handleOrderConfirmation(order);
            }


        } catch (err) {
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

    if (loadingSuccess) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <AppText style={{ marginTop: 12, color: "#333" }}>
                    Placing your order...
                </AppText>
            </View>
        );
    }

    if (isOrderPlaced) {
        return (
            <OrderSuccess
                order={{
                    ...orderDetails,
                    id: orderDetails.number,
                    date: `${formatTimestampDate(orderDetails.orderDate)}`,
                    amount: orderDetails.finalTotal,
                    status: orderDetails.status,
                }}
                navigation={navigation}
            />
        );
    }

    if (cart.length === 0) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
                <ScreenHeader
                    title={StackNames.Checkout}
                    navigation={navigation}
                />
                <View style={styles.container}>
                    <View style={styles.emptyContainer}>
                        <AppText style={styles.emptyText}>Your cart is empty</AppText>
                        <TouchableOpacity
                            style={styles.shopButton}
                            onPress={() => navigation.navigate(StackNames.MainAppStack)}
                        >
                            <AppText style={styles.shopButtonText}>Continue Shopping</AppText>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
            <ScreenHeader
                title={StackNames.Checkout}
                navigation={navigation}
            />
            <View style={styles.container}>
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false} automaticallyAdjustKeyboardInsets>
                    {/* Order Summary */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Order Summary</AppText>
                        {cart.map((item, index) => {

                            const selectedVariant: any = item.product.variants.find(product => product.size === item.selectedSize && product.color === item.selectedColor);

                            return (
                                <View key={index} style={styles.orderItem}>
                                    <View style={styles.orderItemInfo}>
                                        <AppText style={styles.orderItemName}>{item.product.title}</AppText>
                                        <AppText variant="small" style={styles.orderItemDetails}>
                                            Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}
                                        </AppText>
                                    </View>
                                    <AppText variant="small" style={styles.orderItemPrice}>{formatCurrency(selectedVariant.price * item.quantity)}</AppText>
                                </View>
                            )
                        })}
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={20} color={Colors.Primary} />
                            <AppText style={styles.sectionTitle}>Delivery Address</AppText>
                        </View>

                        {
                            !selectedLocation ? (
                                <TouchableOpacity style={styles.addAddressButton} onPress={() => navigation.navigate(StackNames.AddressesScreen, { isAddAddress: true })}>
                                    <Plus size={20} color="#333" />
                                    <AppText style={styles.addAddressText}>Add New Address</AppText>
                                </TouchableOpacity>
                            ) :
                                (
                                    <TouchableOpacity
                                        style={[styles.addressOption, { justifyContent: 'space-between' }]}
                                        onPress={() => setShowLocationSelector(true)}
                                    >
                                        <AppText style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">{getSelectedLocation(selectedLocation)}</AppText>
                                        <ChevronDown size={16} color="#333" />
                                    </TouchableOpacity>
                                )
                        }



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
                            <CreditCard size={20} color={Colors.Primary} />
                            <AppText style={styles.sectionTitle}>Payment Method</AppText>
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
                                <AppText style={styles.paymentIcon}>{method.icon}</AppText>
                                <AppText style={styles.paymentText}>{method.name}</AppText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Order Notes */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Order Notes (Optional)</AppText>
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
                        <AppText variant="medium" style={[styles.sectionTitle, { marginBottom: moderateScale(10) }]}>Price Details</AppText>
                        <View style={styles.priceRow}>
                            <AppText style={styles.priceLabel}>Subtotal</AppText>
                            <AppText style={styles.priceValue}>{formatCurrency(cartTotal)}</AppText>
                        </View>
                        <View style={styles.priceRow}>
                            <AppText style={styles.priceLabel}>Delivery Fee</AppText>
                            <AppText style={styles.priceValue}>{formatCurrency(deliveryFee)}</AppText>
                        </View>
                        <View style={styles.priceRow}>
                            <AppText style={styles.priceLabel}>Tax ({taxPercentage}%)</AppText>
                            <AppText style={styles.priceValue}>{formatCurrency(tax)}</AppText>
                        </View>
                        <View style={styles.priceRow}>
                            <AppText style={styles.priceLabel}>Platform Fee</AppText>
                            <AppText style={styles.priceValue}>{formatCurrency(platformFee)}</AppText>
                        </View>
                        <View style={[styles.priceRow, styles.totalRow]}>
                            <AppText style={styles.totalLabel}>Total</AppText>
                            <AppText style={styles.totalValue}>{formatCurrency(finalTotal)}</AppText>
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
                            style={{ borderRadius: 8 }}
                        >
                            <View style={[styles.placeOrderButton, isProcessing && styles.disabledButton]}>
                                <CheckCircle size={20} color={Colors.light.primaryButtonForeground} />
                                <AppText style={styles.placeOrderText}>
                                    {isProcessing ? 'Processing...' : `Place Order • ${formatCurrency(finalTotal)}`}
                                </AppText>
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
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    orderItemDetails: {
        color: '#666',
    },
    orderItemPrice: {
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
        borderColor: Colors.Primary,
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
        backgroundColor: Colors.Primary,
    },
    addressText: {
        color: '#333',
        flex: 1,
    },
    paymentIcon: {
        marginRight: 12,
    },
    paymentText: {
        color: '#333',
        flex: 1,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 8,
        padding: 12,
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
        color: '#666',
    },
    priceValue: {
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
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontWeight: 'bold',
        color: '#000',
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
        fontWeight: 'bold',
        color: '#fff',
    },
    locationText: {
        fontWeight: '600',
        color: '#333',
        marginHorizontal: 6,
        maxWidth: '90%',
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e9ecef',
        borderStyle: 'dashed',
    },
    addAddressText: {
        fontWeight: '500',
        color: '#333',
        marginLeft: 8,
    },
});