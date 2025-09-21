/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Bell,
  ChevronRight,
  Edit3,
  Heart,
  HelpCircle,
  Info,
  LogOut,
  MapPin,
  Shield,
  ShoppingBag,
  User
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../store/useStore';
import { Order } from '../../types/types';
import { firebaseService } from '../../services/firebaseService';
import { StackNames } from '../../constants/StackNames';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../constants/Colors';
import { formatCurrency } from '../../services/utilityService';
import AppText from '../../components/ui/AppText';
import { getVersion } from 'react-native-device-info';

export default function Profile({ navigation }: any) {
  const { user, userProfile, logout } = useAuth();
  const { favorites } = useStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');

  const userId: any = user?.uid;
  const isLoggedIn = !!userProfile;



  const [orders, setOrder] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    const unsubscribe = firebaseService?.subscribeToOrder(userId, (data) => {
      setOrder(data);
      const values: Record<string, Animated.Value> = {};
      data?.forEach(order => { values[order.orderId || ''] = new Animated.Value(1); });
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    (function fetchAppVersion() {
      const version = getVersion();
      setCurrentVersion(version);
    })();

    if (!userId) return;
    const unsubscribe = firebaseService?.subscribeToUser(userId, (data) => {
      setIsAdmin(data?.isAdmin || false);
    });
    return () => unsubscribe?.();
  }, [userId]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            const result = await logout();
            console.log('result', result)
            setIsLoggingOut(false);
            if (result?.success) {
              // navigation.navigate(StackNames.AuthStack);
              navigation.reset({
                index: 0,
                routes: [{ name: StackNames.AuthStack }],
              });
            } else {
              Alert.alert('Error', result.error || 'Failed to logout');
            }
          },
        },
      ],
    );
  };

  const menuItems = [
    { id: 'admin_panel', icon: Shield, title: "Admin Panel", subtitle: "Manage app content", route: StackNames.AdminScreen, isAdminUser: true, loginOnly: true },
    { id: 'my_orders', icon: ShoppingBag, title: "My Orders", subtitle: "Track your orders", route: StackNames.Orders, loginOnly: true },
    { id: 'wishlist', icon: Heart, title: "Wishlist", subtitle: "Your favorite items", route: StackNames.WishListScreen },
    { id: 'addresses', icon: MapPin, title: "Addresses", subtitle: "Manage delivery addresses", route: StackNames.AddressesScreen, loginOnly: true },
    // { id: 'payment_methods', icon: CreditCard, title: "Payment Methods", subtitle: "Cards & wallets", route: StackNames.PaymentMethodsScreen, loginOnly: true },
    { id: 'notifications', icon: Bell, title: "Notifications", subtitle: "Alerts & updates", route: StackNames.NotificationsScreen },
    { id: 'about', icon: Info, title: "About Us", subtitle: "About Us", route: StackNames.AboutUs },
    { id: 'help_support', icon: HelpCircle, title: "Help & Support", subtitle: "Get assistance", route: "" },
    // { icon: Settings, title: "Settings", subtitle: "App preferences", route: StackNames.SettingsScreen },
  ];

  const filteredMenuItems = menuItems?.filter(item => {
    if (item?.id === 'admin_panel') {
      return isAdmin === true;
    }
    return true;
  });

  const handleMenuPress = (item: any) => {
    if (item?.loginOnly && !isLoggedIn) {
      navigation.navigate(StackNames.AuthStack);
      return;
    }

    if (item?.id === 'admin_panel' && !isAdmin) {
      return;
    }

    if (item?.route && typeof item.route === 'string') {
      navigation.navigate(item.route as never);
    }
  };

  const renderMenuItem = (item: any, index: number) => {
    const IconComponent = item.icon;
    const isAdminPanel = item.title === "Admin Panel";

    return (
      <TouchableOpacity
        key={index}
        style={[styles.menuItem, isAdminPanel && styles.adminMenuItem]}
        onPress={() => handleMenuPress(item)}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconContainer, isAdminPanel && styles.adminIconContainer]}>
            <IconComponent size={20} color={isAdminPanel ? "#8B5CF6" : "#666"} />
          </View>
          <View style={styles.menuItemText}>
            <AppText variant="medium" style={[styles.menuItemTitle, isAdminPanel && styles.adminMenuItemTitle]}>{item.title}</AppText>
            <AppText variant="regular" style={styles.menuItemSubtitle}>{item.subtitle}</AppText>
            {isAdminPanel && (
              <View style={styles.adminBadge}>
                <AppText variant="small" style={styles.adminBadgeText}>ADMIN</AppText>
              </View>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={isAdminPanel ? "#8B5CF6" : "#ccc"} />
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[Colors.light.homeScreenHeaderBackground.start, Colors.light.homeScreenHeaderBackground.end]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              {userProfile?.photoURL ? (
                <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
              ) : (
                <User size={28} color="#666" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <AppText variant="large" style={styles.userName}>
                {userProfile?.displayName || user?.displayName || 'Guest User'}
              </AppText>
              <AppText variant="medium" style={styles.userEmail}>
                {userProfile?.email || user?.email || 'guest@example.com'}
              </AppText>
            </View>
            {
              isLoggedIn && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate(StackNames.EditProfile)}
                >
                  <Edit3 size={20} color="#3742fa" />
                </TouchableOpacity>
              )
            }
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <AppText variant="large" style={styles.statNumber}>{isLoggedIn ? orders.length : 0}</AppText>
              <AppText variant="medium" style={styles.statLabel}>Orders</AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AppText variant="large" style={styles.statNumber}>{isLoggedIn ? favorites.length : 0}</AppText>
              <AppText variant="medium" style={styles.statLabel}>Wishlist</AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AppText variant="large" style={styles.statNumber}>
                {formatCurrency(isLoggedIn
                  ? orders
                    .filter(order => order?.status !== 'cancelled')
                    .reduce((total, order) => Number(total) + Number(order?.finalTotal || 0), 0)
                  : 0)
                }
              </AppText>
              <AppText variant="medium" style={styles.statLabel}>Spent</AppText>
            </View>
          </View>

          <View style={styles.menuContainer}>
            {filteredMenuItems.map(renderMenuItem)}
          </View>

          {
            userProfile && (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut size={20} color="#ff4757" />
                <AppText variant='medium' style={styles.logoutText}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </AppText>
              </TouchableOpacity>
            )
          }

          <View style={styles.footer}>
            <AppText style={styles.footerText}>{currentVersion}</AppText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f0f2ff',
    borderRadius: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.light.homeScreenHeaderForeground,
    marginBottom: 4,
  },
  userEmail: {
    color: Colors.light.homeScreenHeaderForeground,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 8,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  logoutText: {
    color: '#ff4757',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#999',
  },
  adminMenuItem: {
    backgroundColor: '#F8F7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  adminIconContainer: {
    backgroundColor: '#EDE9FE',
  },
  adminMenuItemTitle: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  adminBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});