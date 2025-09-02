import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID not found');
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
            console.log('Push token:', token);
        } catch (e) {
            console.log('Error getting push token:', e);
            token = `${Platform.OS}-${Date.now()}`;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function sendLocalNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data,
        },
        trigger: null,
    });
}

export async function sendOrderNotification(orderStatus: string, orderNumber: string) {
    const notifications = {
        pending: {
            title: 'Order Placed Successfully! 🎉',
            body: `Your order #${orderNumber} has been placed and is being processed.`
        },
        confirmed: {
            title: 'Order Confirmed ✅',
            body: `Your order #${orderNumber} has been confirmed and will be shipped soon.`
        },
        shipped: {
            title: 'Order Shipped 🚚',
            body: `Your order #${orderNumber} is on its way! Track your package for updates.`
        },
        delivered: {
            title: 'Order Delivered 📦',
            body: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`
        },
        cancelled: {
            title: 'Order Cancelled ❌',
            body: `Your order #${orderNumber} has been cancelled. Refund will be processed soon.`
        }
    };

    const notification = notifications[orderStatus as keyof typeof notifications];
    if (notification) {
        await sendLocalNotification(notification.title, notification.body, { orderNumber, orderStatus });
    }
}