import { Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
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
    const options: any = {
        description: params.description,
        image: 'http://staging.autogeniuslite.com/app-assets/img/ico/favicon-32.png',
        currency: 'INR',
        key: params.key, // Test API Key
        amount: params.amount, // amount in paisa
        name: params.companyName,
        // order_id: params.orderId, // Razorpay Order ID from backend
        order_id: 'order_RDRiQAg7DFKd2f', // Razorpay Order ID from backend
        prefill: {
            email: params.email,
            contact: params.contact,
            name: params.name,
        },
        notes: {
            transactionId: params.transactionId || '',
            userId: params.userId || '',
        },
        theme: { color: '#fff' },
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