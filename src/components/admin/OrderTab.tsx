
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Order, OrderItem } from '../../types/types';
import { useAuth } from '../../context/AuthContext';
import { firebaseService } from '../../services/firebaseService';
import { formatDate, formatTimestampDate, getEstimatedDeliveryDate, getStatusColor, getTimestampToDate } from '../../services/utilityService';
import { Colors } from '../../constants/Colors';
import { StackNames } from '../../constants/stackNames';
// import ProductFormModal from './ProductFormModal';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock size={16} color="#ffa502" />;
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

export default function OrderTab({navigation, route}: any) {
  const { products, loading, deleteProduct } = useFirebaseData();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  const [orders, setOrder] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, Animated.Value>>({});
  const { user }: any = useAuth();
  const userId = user.uid;

  // React.useEffect(() => {
  //   (async () => {
  //     const orders = await firebaseService.getAllOrders();
  //     setOrder(orders);
  //   })();
  // }, []);

  React.useEffect(() => {
    const unsubscribe = firebaseService.subscribeToAllOrders((data) => {
      setOrder(data);
      const values: Record<string, Animated.Value> = {};
      data.forEach(order => { values[order.orderId] = new Animated.Value(1); });
      setAnimatedValues(values);
    });
    return () => unsubscribe();
  }, []);

  const goToOrder = (order: Order) => {
  navigation.navigate(StackNames.Orders, {
    id: order.id || '', // required
    orderId: order.orderId,
    placedOn: `${formatTimestampDate(order.orderDate)}`,
    items: order.items, // 👈 no need stringify unless you really want to
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
  });
};

  const toggleOrderExpansion = (orderId: string) => {
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


    const isExpanded = expandedOrder === order.orderId;
    const animatedHeight = isExpanded ? animatedValues[order.orderId]?.interpolate({
      inputRange: [0, 1],
      outputRange: [0, order.items.length * 75],
    }) || new Animated.Value(0) : 0;


    const handleAction = async (action: string) => {
      switch (action) {
        case 'accept':
          Alert.alert(
            'Accept Order',
            'Are you sure you want to accept this order?',
            [
              {
                text: 'Cancel',
                onPress: () => null
              },
              {
                text: 'Confirm',
                onPress: () => null
              }
            ]
          );
          break;
        case 'reject':
          Alert.alert(
            'Reject Order',
            'Are you sure you want to reject this order?',
            [
              {
                text: 'Cancel',
                onPress: () => null
              },
              {
                text: 'Confirm',
                onPress: () => null
              }
            ]
          );
          break;
      }
    }

    return (
      <View key={order.orderId} style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(order.orderId)}
        >
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.orderNumber}>#{order.orderId}</Text>
            <Text style={styles.orderDate}>{formatTimestampDate(order.orderDate)}</Text>
          </View>

          <View style={styles.orderHeaderRight}>
            <View style={styles.statusContainer}>
              {getStatusIcon(order.status)}
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
            <Text style={styles.orderTotal}>₹{order.finalTotal.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>

        <Animated.View style={[styles.orderItems, { height: animatedHeight }]}>
          {order.items.map((item: OrderItem, index: number) => (
            <View key={index} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemVariant}>{item.size} • {item.color}</Text>
                <Text style={styles.itemPrice}>₹{item.price.toLocaleString()} × {item.quantity} QTY</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={styles.orderActions}>
          {
            order.status === 'pending' && (
              <>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { backgroundColor: Colors.light.success, borderColor: Colors.light.success }]} onPress={() => handleAction('accept')}>
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText, { color: '#fff' }]}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.secondaryButton, { backgroundColor: Colors.light.danger, borderColor: Colors.light.danger }]} onPress={() => handleAction('reject')}>
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText, { color: '#fff' }]}>Reject</Text>
                </TouchableOpacity>
              </>
            )
          }
          <TouchableOpacity style={[styles.actionButton]} onPress={() => goToOrder(order)}>
            <Text style={[styles.actionButtonText]}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading.products) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003873" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Package size={24} color="#003873" />
          <Text style={styles.headerTitle}>Orders ({orders.length})</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
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
    fontSize: 16,
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4
  },
  productCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4
  },
  productStats: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#333',
  },
});