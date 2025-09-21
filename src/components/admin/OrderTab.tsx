
import { Check, CheckCircle, Clock, Package, ShoppingBag, Truck, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Order, OrderItem } from '../../types/types';
import { firebaseService } from '../../services/firebaseService';
import { formatCurrency, formatDate, formatTimestampDate, getEstimatedDeliveryDate, getStatusColor, getTimestampToDate, sortByDateDesc } from '../../services/utilityService';
import { Colors } from '../../constants/Colors';
import { StackNames } from '../../constants/StackNames';
import AppText from '../ui/AppText';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} color="#ffa502" />;
    case 'confirmed':
      return <Check size={16} color="#2ed573" />;
    case 'processing':
      return <Package size={16} color="#3742fa" />;
    case 'shipped':
      return <Truck size={16} color="#2f3542" />;
    case 'delivered':
      return <CheckCircle size={16} color="#2ed573" />;
    case 'cancelled':
      return <XCircle size={16} color="#ff4757" />;
    default:
      return <Clock size={16} color="#ffa502" />;
  }
};

export default function OrderTab({ navigation }: any) {
  const { loading } = useFirebaseData();
  const [refreshing, setRefreshing] = useState(false);

  const [orders, setOrder] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, Animated.Value>>({});

  // React.useEffect(() => {
  //   (async () => {
  //     const orders = await firebaseService.getAllOrders();
  //     setOrder(orders);
  //   })();
  // }, []);

  React.useEffect(() => {
    const unsubscribe = firebaseService.subscribeToAllOrders((data) => {
      const sortedData = sortByDateDesc(data, "orderDate");

      setOrder(sortedData);
      console.log("Subscribed to orders:", sortedData);

      const values: Record<string, Animated.Value> = {};
      sortedData.forEach((order) => {
        if (order?.orderId) {
          values[order.orderId] = new Animated.Value(1);
        }
      });
      setAnimatedValues(values);
    });

    return () => unsubscribe();
  }, []);

  const goToOrder = (order: Order) => {
    console.log("Navigating to Order Details for order:", order);
    navigation.navigate(StackNames.AdminOrderDetailsScreen, {
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
        userId: order.userId || '',
        orderNumber: order.orderNumber || '',
      },
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleOrderExpansion = (orderId: any) => {
    const isExpanded = expandedOrder === orderId;

    if (isExpanded) {
      Animated.timing(animatedValues[orderId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setExpandedOrder(null));
    } else {
      setExpandedOrder(orderId);
      Animated.timing(animatedValues[orderId], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderOrderItem = (order: Order) => {

    const isExpanded = order?.orderId ? expandedOrder === order?.orderId : false;
    const animatedHeight = order?.orderId && isExpanded
      ? animatedValues[order?.orderId]?.interpolate({
        inputRange: [0, 1],
        outputRange: [0, order?.items?.length * 75],
      }) || new Animated.Value(0)
      : 0;


    // const handleAction = (action: string, order: Order & { userId?: string }) => {
    //   const status = action === 'accept' ? 'confirmed' : 'cancelled';

    //   Alert.alert(
    //     `${action === 'accept' ? 'Accept' : 'Reject'} Order`,
    //     `Are you sure you want to ${action} this order?`,
    //     [
    //       { text: 'Cancel', style: 'cancel' },
    //       {
    //         text: 'Confirm',
    //         onPress: async () => {
    //           if (order.userId && order.id) {
    //             console.log(
    //               `Updating order ${order.orderId} (docId: ${order.id}) for user ${order.userId} to status ${status}`
    //             );
    //             try {
    //               await firebaseService.updateOrder(order.userId, order.id, { status });

    //               // ✅ Show success message
    //               Alert.alert(
    //                 "Success",
    //                 `Order has been ${status === "confirmed" ? "accepted" : "rejected"} successfully.`
    //               );
    //             } catch (error) {
    //               console.error("Failed to update order status:", error);
    //               Alert.alert("Error", "Failed to update order status. Please try again.");
    //             }
    //           } else {
    //             console.warn("Missing userId or Firestore doc id for updating order", order);
    //           }
    //         }
    //       }
    //     ]
    //   );
    // };

    return (
      <View key={order.orderId} style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(order?.orderId)}
        >
          <View style={styles.orderHeaderLeft}>
            {/* <Text style={styles.orderNumber}>#{order.orderId}</Text> */}
            <AppText style={styles.orderNumber}>{order.orderNumber || 'NA'}</AppText>
            <AppText variant="small" style={styles.orderDate}>{formatTimestampDate(order.orderDate)}</AppText>
          </View>

          <View style={styles.orderHeaderRight}>
            <View style={styles.statusContainer}>
              {getStatusIcon(order.status)}
              <AppText variant="small" style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1)}
              </AppText>
            </View>
            <AppText style={styles.orderTotal}>{formatCurrency(order?.finalTotal)}</AppText>
          </View>
        </TouchableOpacity>

        <Animated.View style={[styles.orderItems, { height: animatedHeight }]}>
          {order?.items?.map((item: OrderItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <AppText style={styles.itemName} numberOfLines={1}>{item.name}</AppText>
                <AppText variant="small" style={styles.itemVariant}>{item.size} • {item.color}</AppText>
                <AppText style={styles.itemPrice}>{formatCurrency(item.price)} × {item.quantity} QTY</AppText>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.orderActions}>
          {/* {
            order.status === 'pending' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton, { backgroundColor: Colors.light.success, borderColor: Colors.light.success }]}
                  onPress={() => handleAction('accept', order)}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText, { color: '#fff' }]}>
                    Accept
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton, { backgroundColor: Colors.light.danger, borderColor: Colors.light.danger }]}
                  onPress={() => handleAction('reject', order)}
                >
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText, { color: '#fff' }]}>
                    Reject
                  </Text>
                </TouchableOpacity>
              </>
            )
          } */}
          <TouchableOpacity style={[styles.actionButton]} onPress={() => goToOrder(order)}>
            <AppText variant="medium" style={[styles.actionButtonText]}>View Details</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading.products) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003873" />
        <AppText style={styles.loadingText}>Loading products...</AppText>
      </View>
    );
  }

  if (orders?.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingBag size={64} color="#ccc" />
        <AppText style={styles.emptyTitle}>No orders yet</AppText>
        <AppText style={styles.emptySubtitle}>
          Orders will appear here once customers place them.
        </AppText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Package size={24} color="#003873" />
          <AppText variant="medium" style={styles.headerTitle}>Orders ({orders.length})</AppText>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.ordersContainer}>
          {orders.map(renderOrderItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 4
  },
  list: {
    padding: 20
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  productInfo: {
    flex: 1,
    marginLeft: 12
  },
  productTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  productCategory: {
    color: '#6B7280',
    marginBottom: 4
  },
  productPrice: {
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statText: {
    color: '#6B7280',
    marginRight: 8
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16
  },
  emptySubtext: {
    color: '#9CA3AF',
    marginTop: 4
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
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
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
    fontWeight: '500',
    marginLeft: 4,
  },
  orderTotal: {
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
    fontWeight: '500',
    color: '#2162a1',
    marginBottom: 2,
  },
  itemVariant: {
    color: '#575959',
    marginBottom: 2,
  },
  itemPrice: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: Colors.light.primaryButtonText,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#333',
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
});