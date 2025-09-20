
import { Building, Edit3, Home, MapPin, Plus, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Address } from '../types/types';
import { firebaseService } from '../services/firebaseService';
import { formatAddress } from '../services/utilityService';
import AddressModal from '../components/AddressModal';

const getAddressIcon = (type: string) => {
  switch (type) {
    case 'home':
      return <Home size={20} color="#333" />;
    case 'work':
      return <Building size={20} color="#333" />;
    default:
      return <MapPin size={20} color="#333" />;
  }
};

export default function AddressesScreen({route, navigation}: any) {
  const { isAddAddress } = route?.params || {};
  const { updateSelectedLocation, selectedLocation } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [animatedValues, setAnimatedValues] = useState<Record<string, Animated.Value>>({});
  const [modalVisible, setModalVisible] = useState(isAddAddress || false );
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { user, userProfile }: any = useAuth();
  const userId = user?.uid || userProfile?.uid;

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToAddresses(userId, (data) => {
      setAddresses(data);
      const values: Record<string, Animated.Value> = {};
      data.forEach(addr => { values[addr.id] = new Animated.Value(1); });
      setAnimatedValues(values);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (data: Omit<Address, "id">, id?: string) => {
    if (id) {
      await firebaseService.updateAddress(userId, id, data);
    } else {
      if (addresses.some(addr => addr.isDefault)) {
        data.isDefault = false; // Only set new address as default if no default exists
      } else {
        data.isDefault = true; // Set first address as default
      }
      await firebaseService.addAddress(userId, data);
    }
    setModalVisible(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Animated.timing(animatedValues[addressId], {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }).start(async () => {
              await firebaseService.deleteAddress(userId, addressId);
            });
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    console.log('default addressId', addressId);
    await updateSelectedLocation(addressId);
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
  };

  const renderAddressCard = (address: Address) => {
    const scaleValue = animatedValues[address.id] || new Animated.Value(1);

    return (
      <Animated.View key={address.id} style={[styles.addressCard, { transform: [{ scale: scaleValue }], opacity: scaleValue }]}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTypeContainer}>
            {getAddressIcon(address.type)}
            <View style={{ flexDirection: 'column' }}>
              <Text style={styles.addressType}>{address.type.charAt(0).toUpperCase() + address.type.slice(1)}</Text>
              <Text style={[styles.addressType, { fontWeight: '500', fontSize: 13, color: '#666' }]}>({address.name})</Text>
            </View>
          </View>
          <View style={[styles.addressActions, { flexDirection: 'row', alignItems: 'center' }]}>
            {address.id === selectedLocation && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={() => { setEditingAddress(address); setModalVisible(true); }}>
              <Edit3 size={16} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteAddress(address.id)}>
              <Trash2 size={16} color="#ff4757" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.addressContent}>
          <Text style={[styles.addressType, { fontWeight: '500', fontSize: 14, color: '#000' }]}>{formatAddress(address)}</Text>
        </View>
        {/* ...rest as it is */}
        {address.id !== selectedLocation && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefault(address.id)}
          >
            <Text style={styles.setDefaultText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right']}>
      {/* header ... */}
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.addAddressButton} onPress={() => { setEditingAddress(null); setModalVisible(true); }}>
          <Plus size={20} color="#333" />
          <Text style={styles.addAddressText}>Add New Address</Text>
        </TouchableOpacity>
        <View style={styles.addressesContainer}>{addresses.map(renderAddressCard)}</View>
      </ScrollView>

      {/* 👇 Modal */}
      <AddressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        editingAddress={editingAddress}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
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
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  addressesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#2ed573',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addressContent: {
    padding: 16,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
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
});