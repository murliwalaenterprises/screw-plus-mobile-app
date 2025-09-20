import { Bell, Heart, Package, Settings as SettingsIcon, Tag, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { StackNames } from '../constants/stackNames';

interface Notification {
  id: string;
  type: 'order' | 'offer' | 'wishlist' | 'general';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationSettings {
  orderUpdates: boolean;
  offers: boolean;
  wishlistAlerts: boolean;
  generalNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const mockNotifications: Notification[] = [
  // {
  //   id: '1',
  //   type: 'order',
  //   title: 'Order Shipped',
  //   message: 'Your order #CS2024002 has been shipped and will arrive in 2-3 days.',
  //   time: '2 hours ago',
  //   isRead: false,
  // },
  // {
  //   id: '2',
  //   type: 'offer',
  //   title: 'Flash Sale Alert!',
  //   message: 'Get up to 70% off on selected items. Limited time offer!',
  //   time: '4 hours ago',
  //   isRead: false,
  // },
  // {
  //   id: '3',
  //   type: 'wishlist',
  //   title: 'Price Drop Alert',
  //   message: 'The Classic White T-Shirt in your wishlist is now 20% off!',
  //   time: '1 day ago',
  //   isRead: true,
  // },
  // {
  //   id: '4',
  //   type: 'order',
  //   title: 'Order Delivered',
  //   message: 'Your order #CS2024001 has been delivered successfully.',
  //   time: '2 days ago',
  //   isRead: true,
  // },
  // {
  //   id: '5',
  //   type: 'general',
  //   title: 'Welcome to Screw Plus!',
  //   message: 'Thank you for joining us. Explore our latest collection and enjoy shopping!',
  //   time: '1 week ago',
  //   isRead: true,
  // },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return <Package size={20} color="#3742fa" />;
    case 'offer':
      return <Tag size={20} color="#ff4757" />;
    case 'wishlist':
      return <Heart size={20} color="#ff6b6b" />;
    default:
      return <Bell size={20} color="#666" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order':
      return '#3742fa20';
    case 'offer':
      return '#ff475720';
    case 'wishlist':
      return '#ff6b6b20';
    default:
      return '#66666620';
  }
};

export default function NotificationsScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    offers: true,
    wishlistAlerts: true,
    generalNotifications: false,
    emailNotifications: true,
    smsNotifications: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [animatedValues] = useState(() => 
    mockNotifications?.reduce((acc, notification) => {
      acc[notification.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    Animated.timing(animatedValues[notificationId], {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderNotificationItem = (notification: Notification) => {
    const scaleValue = animatedValues[notification.id];

    return (
      <Animated.View
        key={notification.id}
        style={[
          styles.notificationCard,
          !notification.isRead && styles.unreadNotification,
          {
            transform: [{ scale: scaleValue }],
            opacity: scaleValue,
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.notificationContent}
          onPress={() => markAsRead(notification.id)}
        >
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) }]}>
            {getNotificationIcon(notification.type)}
          </View>
          
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteNotification(notification.id)}
          >
            <Trash2 size={16} color="#999" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSettings = () => (
    <View style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Package size={20} color="#3742fa" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Order Updates</Text>
            <Text style={styles.settingSubtitle}>Get notified about order status</Text>
          </View>
        </View>
        <Switch
          value={settings.orderUpdates}
          onValueChange={(value) => updateSetting('orderUpdates', value)}
          trackColor={{ false: '#e9ecef', true: '#3742fa' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Tag size={20} color="#ff4757" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Offers & Deals</Text>
            <Text style={styles.settingSubtitle}>Receive promotional notifications</Text>
          </View>
        </View>
        <Switch
          value={settings.offers}
          onValueChange={(value) => updateSetting('offers', value)}
          trackColor={{ false: '#e9ecef', true: '#ff4757' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Heart size={20} color="#ff6b6b" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Wishlist Alerts</Text>
            <Text style={styles.settingSubtitle}>Price drops and stock updates</Text>
          </View>
        </View>
        <Switch
          value={settings.wishlistAlerts}
          onValueChange={(value) => updateSetting('wishlistAlerts', value)}
          trackColor={{ false: '#e9ecef', true: '#ff6b6b' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Bell size={20} color="#666" />
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>General Notifications</Text>
            <Text style={styles.settingSubtitle}>App updates and announcements</Text>
          </View>
        </View>
        <Switch
          value={settings.generalNotifications}
          onValueChange={(value) => updateSetting('generalNotifications', value)}
          trackColor={{ false: '#e9ecef', true: '#666' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.divider} />

      <Text style={styles.subsectionTitle}>Communication Preferences</Text>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
        </View>
        <Switch
          value={settings.emailNotifications}
          onValueChange={(value) => updateSetting('emailNotifications', value)}
          trackColor={{ false: '#e9ecef', true: '#333' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingTitle}>SMS Notifications</Text>
        </View>
        <Switch
          value={settings.smsNotifications}
          onValueChange={(value) => updateSetting('smsNotifications', value)}
          trackColor={{ false: '#e9ecef', true: '#333' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top','left', 'right']}>
       <ScreenHeader
                title={StackNames.NotificationsScreen}
                navigation={navigation}
            />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSettings(!showSettings)}
          >
            <SettingsIcon size={20} color="#333" />
          </TouchableOpacity>
          {notifications.length > 0 && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={clearAllNotifications}
            >
              <Trash2 size={20} color="#ff4757" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {showSettings && renderSettings()}
        
        <View style={styles.notificationsContainer}>
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color="#ccc" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySubtitle}>You&apos;re all caught up!</Text>
            </View>
          ) : (
            notifications.map(renderNotificationItem)
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  settingsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 16,
  },
  notificationsContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#3742fa',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
  },
});