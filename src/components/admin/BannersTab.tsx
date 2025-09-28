import { Edit3, Image as ImageIcon, MoreVertical, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BannerFormModal from './BannerFormModal';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Banner } from '../../types/product';
import { QuickMenu } from '../ui';

export default function BannersTab() {
  const { banners, loading, deleteBanner } = useFirebaseData();
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (banner: Banner) => {
    Alert.alert(
      'Delete Banner',
      `Are you sure you want to delete "${banner.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBanner(banner.id);
              Alert.alert('Success', 'Banner deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderBanner = ({ item }: { item: Banner }) => (
    <View style={styles.bannerCard}>
      <Image source={{ uri: item.image }} style={styles.bannerImage} />
      <View style={styles.bannerInfo}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <Text style={styles.bannerCta}>{item.cta}</Text>
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

  if (loading.banners) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading banners...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ImageIcon size={24} color="#F59E0B" />
          <Text style={styles.headerTitle}>Banners ({banners.length})</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Banner</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ImageIcon size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No banners found</Text>
            <Text style={styles.emptySubtext}>Add your first banner to get started</Text>
          </View>
        }
      />

      <BannerFormModal
        visible={showForm}
        banner={editingBanner}
        onClose={() => {
          setShowForm(false);
          setEditingBanner(null);
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
    backgroundColor: '#F59E0B',
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
  bannerCard: {
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
  bannerImage: {
    width: 100,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  bannerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2
  },
  bannerCta: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500'
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
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4
  }
});