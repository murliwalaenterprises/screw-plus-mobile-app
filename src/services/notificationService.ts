import PushNotification, { Importance } from 'react-native-push-notification';

// Create channel for Android
PushNotification.createChannel(
    {
        channelId: 'default',
        channelName: 'Default Channel',
        importance: Importance.HIGH,
        vibrate: true,
    },
    (created) => console.log(`createChannel returned '${created}'`)
);

// Register device for notifications (Android/iOS)
export function registerForPushNotificationsAsync() {
    return new Promise<string>((resolve) => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log('Push Token:', token);
                resolve(token.token);
            },
            onNotification: function (notification) {
                console.log('Notification received:', notification);
                // CLI me notification.finish() ki zarurat nahi
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: true,
        });
    });
}

// Send local notification
export function sendLocalNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
        channelId: 'default',
        title,
        message,
        userInfo: data,
        playSound: true,
        soundName: 'default',
        importance: 'high',
    });
}

// Order-specific notifications
export function sendOrderNotification(orderStatus: string, orderNumber: string) {
    const notifications: Record<string, { title: string; body: string }> = {
        pending: {
            title: 'Order Placed Successfully! 🎉',
            body: `Your order #${orderNumber} has been placed and is being processed.`,
        },
        confirmed: {
            title: 'Order Confirmed ✅',
            body: `Your order #${orderNumber} has been confirmed and will be shipped soon.`,
        },
        shipped: {
            title: 'Order Shipped 🚚',
            body: `Your order #${orderNumber} is on its way! Track your package for updates.`,
        },
        delivered: {
            title: 'Order Delivered 📦',
            body: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`,
        },
        cancelled: {
            title: 'Order Cancelled ❌',
            body: `Your order #${orderNumber} has been cancelled. Refund will be processed soon.`,
        },
    };

    const notification = notifications[orderStatus];
    if (notification) {
        sendLocalNotification(notification.title, notification.body, { orderNumber, orderStatus });
    }
}
