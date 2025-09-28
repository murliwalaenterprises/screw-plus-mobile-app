import { Edit3, MoreVertical, Package, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import NewProductFormModal from './NewProductFormModal';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Product } from '../../types/product';
import { formatCurrency } from '../../services/utilityService';
import { AppText, QuickMenu } from '../ui';

export default function ProductsTab() {
  const { products, loading, deleteProduct } = useFirebaseData();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <AppText style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </AppText>
        <AppText variant="small" style={styles.productCategory}>{item.category}</AppText>
        <AppText style={styles.productPrice}>{formatCurrency(item.price)}</AppText>
        <View style={styles.productStats}>
          <AppText variant="small" style={styles.statText}>★ {item.rating}</AppText>
          <AppText variant="small" style={styles.statText}>({item.reviews})</AppText>
        </View>
      </View>
      <View style={styles.actions}>
        <QuickMenu icon={<MoreVertical size={12} color="#222" />} options={[
          {
            label: "Edit",
            icon: <Edit3 size={12} color="#222" />,
            onPress: () => handleEdit(item),
          },
          {
            label: "Delete",
            icon: <Trash2 size={12} color="#EF4444" />,
            onPress: () => handleDelete(item),
            textColor: "#EF4444",
          }
        ]} />
      </View>
    </View>
  );

  if (loading.products) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <AppText style={styles.loadingText}>Loading products...</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Package size={24} color="#3B82F6" />
          <AppText style={styles.headerTitle}>Products ({products.length})</AppText>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Plus size={20} color="#FFFFFF" />
          <AppText style={styles.addButtonText}>Add Product</AppText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color="#9CA3AF" />
            <AppText style={styles.emptyText}>No products found</AppText>
            <AppText style={styles.emptySubtext}>Add your first product to get started</AppText>
          </View>
        }
      />

      <NewProductFormModal
        visible={showForm}
        product={editingProduct}
        onClose={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
      />
    </View>
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
    alignItems: 'flex-start',
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
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
  }
});