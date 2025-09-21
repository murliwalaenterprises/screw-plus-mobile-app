/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Check, CheckCircle, Clock, Package, ShoppingBag, Truck, XCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderItem } from '../../types/types';
import { firebaseService } from '../../services/firebaseService';
import { formatCurrency, formatDate, formatTimestampDate, getEstimatedDeliveryDate, getStatusColor, getTimestampToDate, sortByDateDesc } from '../../services/utilityService';
import { StackNames } from '../../constants/StackNames';
import { Colors } from '../../constants/Colors';
import TrackOrder from './TrackOrder';
import ScreenHeader from '../../components/ScreenHeader';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} color="#ffa502" />;
    case 'processing':
      return <Package size={16} color="#3742fa" />;
    case 'shipped':
      return <Truck size={16} color="#2f3542" />;
    case 'confirmed':
      return <Check size={16} color="#2ed573" />;
    case 'delivered':
      return <CheckCircle size={16} color="#2ed573" />;
    case 'cancelled':
      return <XCircle size={16} color="#ff4757" />;
    default:
      return <Clock size={16} color="#ffa502" />;
  }
};

export default function OrdersScreen({ navigation, router }: any) {
  const [orders, setOrder] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, Animated.Value>>({});
  const { user, userProfile }: any = useAuth();
  const userId = user?.uid || userProfile?.uid;
  const [showTrackOrder, setShowTrackOrder] = React.useState<boolean>(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);


  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToOrder(userId, (data) => {
      const sortedData = sortByDateDesc(data, "orderDate");

      setOrder(sortedData);

      const values: Record<string, Animated.Value> = {};
      // data.forEach(order => { values[order.orderId] = new Animated.Value(1); });
      setAnimatedValues(values);
    });

    return () => unsubscribe();
  }, []);

  const toggleOrderExpansion = (orderId: any) => {
    if (!animatedValues[orderId]) {
      animatedValues[orderId] = new Animated.Value(0);
    }

    const isExpanded = expandedOrder === orderId;
    if (isExpanded) {
      Animated.timing(animatedValues[orderId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setExpandedOrder(null));
    } else {
      setExpandedOrder(orderId);
      console.log("Set expanded order to:", orderId);
      Animated.timing(animatedValues[orderId], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };


  const goToOrder = (order: Order) => {
    console.log("Navigating to Order Details for order:", order);
    navigation.navigate(StackNames.OrderDetailsScreen, {
      order: {
        id: order.id || '',
        orderId: order.orderId,
        placedOn: `${formatTimestampDate(order.orderDate)}`,
        items: order.items,
        status: order.status,
        estimatedDelivery: `${formatDate(
          getEstimatedDeliveryDate(getTimestampToDate(order.orderDate))
        )}`,
        deliveryAddress: order.deliveryAddress,
        billingAddress: order.deliveryAddress,
        paymentMethod: order.paymentMethod,
        subTotal: order.subTotal,
        deliveryFee: order.deliveryFee,
        platformFee: order.platformFee,
        discount: order.discount,
        taxPercentage: order.taxPercentage,
        taxAmount: order.taxAmount,
        total: order.finalTotal,
        orderNumber: order.orderNumber || '',
      },
    });
  };

  const renderOrderItem = (order: Order) => {
    const isExpanded = order?.orderId ? expandedOrder === order?.orderId : false;
    const animatedHeight = order?.orderId && isExpanded
      ? animatedValues[order?.orderId]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, order?.items?.length * 75],
      }) || new Animated.Value(0)
      : 0;

    return (
      <View key={order.orderId} style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(order?.orderId)}
        >
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatTimestampDate(order.orderDate)}</Text>
          </View>

          <View style={styles.orderHeaderRight}>
            <View style={styles.statusContainer}>
              {getStatusIcon(order.status)}
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status?.charAt(0)?.toUpperCase() + order?.status?.slice(1)}
              </Text>
            </View>
            <Text style={styles.orderTotal}>{formatCurrency(order?.finalTotal)}</Text>
          </View>
        </TouchableOpacity>

        <Animated.View
          style={[styles.orderItems, { height: animatedHeight }]}
        >
          {order.items?.map((item: OrderItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item?.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item?.name}</Text>
                <Text style={styles.itemVariant}>{item.size} • {item?.color}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.price)} × {item?.quantity} QTY</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.orderActions}>

          {!['cancelled'].includes(order.status) && (
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              setSelectedOrder(order);
              setShowTrackOrder(true)
            }}>
              <Text style={styles.actionButtonText}>Track Order</Text>
            </TouchableOpacity>
          )}

          {order.status === 'delivered' && (
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Reorder</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => goToOrder(order)}>
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>View Details</Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  };

  if (orders?.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title={StackNames.Orders}
          navigation={navigation}
        />
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Start shopping to see your orders here
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate(StackNames.MainAppStack)}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={StackNames.Orders}
        navigation={navigation}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: '#f8f9fa' }} contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}>
        <View style={styles.ordersContainer}>
          {orders.map(renderOrderItem)}
        </View>
      </ScrollView>

      <TrackOrder
        data={selectedOrder}
        visible={showTrackOrder}
        onClose={() => setShowTrackOrder(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.StatusBarBg,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  ordersContainer: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderItems: {
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2162a1',
    marginBottom: 2,
  },
  itemVariant: {
    fontSize: 12,
    color: '#575959',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: '#0f1111',
    fontWeight: '500',
  },
  orderActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.light.primaryButton,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: Colors.light.primaryButtonText,
    fontSize: 15,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
});