import { CreditCard, Plus, Smartphone, Trash2, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet';
  name: string;
  details: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'HDFC Bank Credit Card',
    details: '**** **** **** 1234',
    lastFour: '1234',
    expiryDate: '12/26',
    isDefault: true,
  },
  {
    id: '2',
    type: 'upi',
    name: 'Google Pay',
    details: 'john.doe@okaxis',
    isDefault: false,
  },
  {
    id: '3',
    type: 'card',
    name: 'SBI Debit Card',
    details: '**** **** **** 5678',
    lastFour: '5678',
    expiryDate: '08/25',
    isDefault: false,
  },
  {
    id: '4',
    type: 'wallet',
    name: 'Paytm Wallet',
    details: 'Balance: ₹2,450',
    isDefault: false,
  },
];

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'card':
      return <CreditCard size={20} color="#333" />;
    case 'upi':
      return <Smartphone size={20} color="#333" />;
    case 'wallet':
      return <Wallet size={20} color="#333" />;
    default:
      return <CreditCard size={20} color="#333" />;
  }
};

const getPaymentTypeColor = (type: string) => {
  switch (type) {
    case 'card':
      return '#3742fa';
    case 'upi':
      return '#2ed573';
    case 'wallet':
      return '#ffa502';
    default:
      return '#333';
  }
};

export default function PaymentMethodsScreen() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [animatedValues] = useState(() =>
    mockPaymentMethods.reduce((acc, method) => {
      acc[method.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

  const handleDeletePaymentMethod = (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Animated.timing(animatedValues[methodId], {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }).start(() => {
              setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
            });
          },
        },
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
  };

  const renderPaymentMethodCard = (method: PaymentMethod) => {
    const scaleValue = animatedValues[method.id];

    return (
      <Animated.View
        key={method.id}
        style={[
          styles.paymentCard,
          {
            transform: [{ scale: scaleValue }],
            opacity: scaleValue,
          },
        ]}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentTypeContainer}>
            <View style={[styles.iconContainer, { backgroundColor: getPaymentTypeColor(method.type) + '20' }]}>
              {getPaymentIcon(method.type)}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>{method.name}</Text>
              <Text style={styles.paymentDetails}>{method.details}</Text>
              {method.expiryDate && (
                <Text style={styles.expiryDate}>Expires: {method.expiryDate}</Text>
              )}
            </View>
          </View>

          <View style={styles.paymentActions}>
            {method.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePaymentMethod(method.id)}
            >
              <Trash2 size={16} color="#ff4757" />
            </TouchableOpacity>
          </View>
        </View>

        {!method.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(method.id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const renderAddPaymentOptions = () => (
    <View style={styles.addPaymentSection}>
      <Text style={styles.sectionTitle}>Add Payment Method</Text>

      <TouchableOpacity style={styles.addPaymentOption}>
        <View style={[styles.iconContainer, { backgroundColor: '#3742fa20' }]}>
          <CreditCard size={20} color="#3742fa" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Credit/Debit Card</Text>
          <Text style={styles.optionSubtitle}>Add your bank card</Text>
        </View>
        <Plus size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.addPaymentOption}>
        <View style={[styles.iconContainer, { backgroundColor: '#2ed57320' }]}>
          <Smartphone size={20} color="#2ed573" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>UPI</Text>
          <Text style={styles.optionSubtitle}>Link your UPI ID</Text>
        </View>
        <Plus size={20} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.addPaymentOption}>
        <View style={[styles.iconContainer, { backgroundColor: '#ffa50220' }]}>
          <Wallet size={20} color="#ffa502" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Digital Wallet</Text>
          <Text style={styles.optionSubtitle}>Connect your wallet</Text>
        </View>
        <Plus size={20} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map(renderPaymentMethodCard)}
        </View>

        {renderAddPaymentOptions()}
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
  paymentMethodsContainer: {
    padding: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  paymentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  expiryDate: {
    fontSize: 12,
    color: '#999',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: '#2ed573',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
  },
  setDefaultButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  addPaymentSection: {
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
  addPaymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
});