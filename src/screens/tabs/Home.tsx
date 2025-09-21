/* eslint-disable react-native/no-inline-styles */

import { useFirebaseData } from '../../store/useFirebaseData';
import { useStore } from '../../store/useStore';
import { Bell, ChevronDown, MapPin, Search, ShoppingCart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import BannerCarousel from '../../components/BannerCarousel';
import CategoryCard from '../../components/CategoryCard';
import LocationSelector from '../../components/LocationSelector';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { StackNames } from '../../constants/StackNames';
import { scale } from 'react-native-size-matters';

export default function Home({ navigation }: any) {
  const { getCartItemsCount } = useStore();
  const { products, categories, banners, loading } = useFirebaseData();
  const { selectedLocation } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  console.log('Products', products);
  const featuredProducts = products?.slice(0, 6);
  const newArrivals = products?.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products?.filter(p => p.isBestseller).slice(0, 4);
  const cartItemsCount = getCartItemsCount();

  const [locations, setLocations] = useState<{ id: string, label: string }[]>([]);


  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productContainer}>
      <ProductCard navigation={navigation} product={item} width={180} />
    </View>
  );

  const getSelectedLocation = (locId: string) => {
    const loc = locations.find(location => location.id === locId);
    if (loc) {
      return loc.label;
    }
    return 'Select Location';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.welcomeText}>Deliver to</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowLocationSelector(true)}
        >
          <MapPin size={16} color="#333" />
          <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
            {getSelectedLocation(selectedLocation)}
          </Text>
          <ChevronDown size={16} color="#333" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate(StackNames.Search)}
        >
          <Search size={24} color={Colors.light.homeScreenHeaderForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate(StackNames.NotificationsScreen)}
        >
          <Bell size={24} color={Colors.light.homeScreenHeaderForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, styles.cartButton]}
          onPress={() => navigation.navigate(StackNames.Cart)}
        >
          <ShoppingCart size={24} color={Colors.light.homeScreenHeaderForeground} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, data: any[], showViewAll = false) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity onPress={() => navigation.navigate(StackNames.ProductListScreen)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.light.homeScreenHeaderBackground.start, Colors.light.homeScreenHeaderBackground.end]}  // gradient colors
      style={styles.container}
      start={{ x: 0, y: 0 }}  // gradient start point
      end={{ x: 1, y: 0 }}    // gradient end point
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={'default'} />
        <View style={styles.container}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {renderHeader()}
            <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }} showsVerticalScrollIndicator={false} contentContainerStyle={{
              paddingBottom: 100
            }}>
              {loading.banners ? (
                <View style={styles.loadingBanner}>
                  <Text style={styles.loadingText}>Loading banners...</Text>
                </View>
              ) : (
                <BannerCarousel banners={banners} />
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shop by Category</Text>
                {loading.categories ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading categories...</Text>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                  >
                    {categories.map((category: any) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </ScrollView>
                )}
              </View>

              {loading.products ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading products...</Text>
                </View>
              ) : (
                <>
                  {newArrivals.length > 0 && renderSection('New Arrivals', newArrivals, true)}
                  {bestSellers.length > 0 && renderSection('Best Sellers', bestSellers, true)}
                  {renderSection('Featured Products', featuredProducts, true)}
                </>
              )}

              <View style={{ backgroundColor: '#f8f8f8', width: '100%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}>
                <Text style={{ fontSize: scale(50), fontWeight: 'bold', opacity: 0.2 }}>Screw Plus</Text>
                <Text style={{ opacity: 0.2, marginTop: 10, }}>Developed By ❤️ Murliwala Enterprises</Text>
              </View>
              <View style={styles.bottomSpacing} />
            </ScrollView>
          </Animated.View>
        </View>

        <LocationSelector
          visible={showLocationSelector}
          onClose={() => setShowLocationSelector(false)}
          getLocations={(loc) => {
            // Handle locations update
            console.log('Selected locations:', loc);
            setLocations(loc);
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flex: 0.7,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.light.homeScreenHeaderForeground,
    fontWeight: '700',
    marginBottom: 2,
    marginLeft: 6
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff4757',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3742fa',
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  bottomSpacing: {
    height: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingBanner: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});