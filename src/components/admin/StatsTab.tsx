import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { BarChart3, Package, Grid3X3, Image, TrendingUp } from 'lucide-react-native';
import { useFirebaseData } from '../../store/useFirebaseData';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

export default function StatsTab() {
  const { products, categories, banners, loading } = useFirebaseData();

  const isLoading = loading.products || loading.categories || loading.banners;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalBanners = banners.length;
  const averagePrice = products.length > 0 
    ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
    : 0;

  const categoryStats = categories.map(category => ({
    name: category.name,
    count: products.filter(p => p.category === category.name).length
  })).sort((a, b) => b.count - a.count);

  const topCategory = categoryStats[0];
  const newProducts = products.filter(p => p.isNew).length;
  const bestsellers = products.filter(p => p.isBestseller).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <BarChart3 size={24} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Statistics Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          color="#3B82F6"
        />
        <StatCard
          title="Categories"
          value={totalCategories}
          icon={Grid3X3}
          color="#10B981"
        />
        <StatCard
          title="Banners"
          value={totalBanners}
          icon={Image}
          color="#F59E0B"
        />
        <StatCard
          title="Average Price"
          value={`₹${averagePrice}`}
          icon={TrendingUp}
          color="#8B5CF6"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Insights</Text>
        <View style={styles.insightGrid}>
          <StatCard
            title="New Products"
            value={newProducts}
            icon={Package}
            color="#06B6D4"
            subtitle={`${Math.round((newProducts / totalProducts) * 100)}% of total`}
          />
          <StatCard
            title="Bestsellers"
            value={bestsellers}
            icon={TrendingUp}
            color="#F97316"
            subtitle={`${Math.round((bestsellers / totalProducts) * 100)}% of total`}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Distribution</Text>
        <View style={styles.categoryList}>
          {categoryStats.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryRank}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.categoryDetails}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} products</Text>
              </View>
              <View style={styles.categoryPercentage}>
                <Text style={styles.percentageText}>
                  {Math.round((category.count / totalProducts) * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {topCategory && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Category</Text>
          <View style={styles.topCategoryCard}>
            <Grid3X3 size={32} color="#10B981" />
            <View style={styles.topCategoryInfo}>
              <Text style={styles.topCategoryName}>{topCategory.name}</Text>
              <Text style={styles.topCategoryStats}>
                {topCategory.count} products • {Math.round((topCategory.count / totalProducts) * 100)}% of inventory
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  content: {
    padding: 20
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
    alignItems: 'center',
    marginBottom: 24
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  insightGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  statInfo: {
    alignItems: 'flex-start'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  categoryRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  categoryDetails: {
    flex: 1
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280'
  },
  categoryPercentage: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 12
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6'
  },
  topCategoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  topCategoryInfo: {
    marginLeft: 16,
    flex: 1
  },
  topCategoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4
  },
  topCategoryStats: {
    fontSize: 14,
    color: '#6B7280'
  }
});