import { Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { Colors } from '../constants/Colors';
import { Company } from '../config/appConfig';
/**
 * Start Razorpay Payment
 * @param params Dynamic payment options like amount, order_id, etc.
 */
export const startRazorpayPayment = (params: {
    amount: number,           // Amount in paisa
    orderId: string,          // Razorpay Order ID
    email: string,
    contact: string,
    name: string,
    companyName: string,
    transactionId?: string,
    userId?: string,
    key?: string,
    description?: string,
    onSuccess?: (paymentData: any) => void,
    onError?: (error: any) => void
}) => {
    const paymentOptions = Company.payments.find(opt => opt.method === 'razorpay');
    if (!paymentOptions) {
        Alert.alert('Payment Error', 'Razorpay payment method is not configured.');
        return;
    }

    if (!params.orderId) {
        Alert.alert('Payment Error', 'Order ID is required for Razorpay payment.');
        return;
    }

    if (!params.amount || params.amount <= 0) {
        Alert.alert('Payment Error', 'Invalid payment amount.');
        return;
    }

    const options: any = {
        description: Company.address,
        image: Company.logoUrl,
        currency: paymentOptions.currency || 'INR',
        key: paymentOptions.key,
        amount: params.amount, // amount in paisa
        name: Company.name,
        order_id: params.orderId, // Razorpay Order ID from backend
        prefill: {
            email: params.email,
            contact: params.contact,
            name: params.name,
        },
        notes: {
            transactionId: params.transactionId || '',
            userId: params.userId || '',
        },
        theme: { color: Colors.light.primaryButtonBackground.end },

    };
    console.log('Razorpay Payment Options:', options);

    RazorpayCheckout.open(options)
        .then((data) => {
            // Success callback
            if (params.onSuccess) {
                params.onSuccess(data);
            } else {
                Alert.alert('Payment Success', `Payment ID: ${data.razorpay_payment_id}`);
            }
        })
        .catch((error) => {
            // Failure callback
            if (params.onError) {
                params.onError(error);
            } else {
                Alert.alert('Payment Failed', `${error.code} | ${error.description}`);
            }
        });
};