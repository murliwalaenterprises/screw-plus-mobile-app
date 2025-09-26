/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import { useFirebaseData } from '../../store/useFirebaseData';
import { useStore } from '../../store/useStore';
import { Bell, ChevronDown, MapPin, Search, ShoppingCart } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Animated, FlatList, Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import BannerCarousel from '../../components/BannerCarousel';
import CategoryCard from '../../components/CategoryCard';
import LocationSelector from '../../components/LocationSelector';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';
import { StackNames } from '../../constants/StackNames';
import { scale, verticalScale } from 'react-native-size-matters';
import AutoHeightImage from '../../components/AutoHeightImage';
import { IconConfig } from '../../constants/Constant';
import { firebaseService } from '../../services/firebaseService';
import { useAppConfig } from '../../store/useAppConfig';
import { AppText } from '../../components/ui';

export default function Home({ navigation }: any) {
  const { getCartItemsCount } = useStore();
  const { products, categories, banners, loading } = useFirebaseData();
  const { selectedLocation } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const { topBarBrandLogo, topBarBackgroundColor, topBarForegroundColor, homeScreenAds, isVisibleSlider, isVisibleCategorySection, setConfig }: any = useAppConfig();

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
    <View style={[styles.header, { paddingLeft: 16 }]}>
      <View style={styles.headerLeft}>
        {
          topBarBrandLogo ? (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center", // vertical center
              }}
            >
              <Image
                source={{ uri: topBarBrandLogo }}
                style={{
                  width: 120,        // max width
                  height: undefined, // height auto adjust
                  aspectRatio: 4,    // maintain proportion
                  resizeMode: "contain",
                }}
              />
            </View>

          ) : (
            <>
              <AppText variant="small" style={[styles.welcomeText, { color: topBarForegroundColor }]}>Deliver to</AppText>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => setShowLocationSelector(true)}
              >
                <MapPin size={16} color="#333" />
                <AppText variant="small" style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                  {getSelectedLocation(selectedLocation)}
                </AppText>
                <ChevronDown size={16} color="#333" />
              </TouchableOpacity>
            </>
          )
        }
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate(StackNames.Search)}
        >
          <Search size={IconConfig.size} color={topBarForegroundColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate(StackNames.NotificationsScreen)}
        >
          <Bell size={IconConfig.size} color={topBarForegroundColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, styles.cartButton]}
          onPress={() => navigation.navigate(StackNames.Cart)}
        >
          <ShoppingCart size={IconConfig.size} color={topBarForegroundColor} />
          {cartItemsCount > 0 && (
            <View style={styles.cartBadge}>
              <AppText style={styles.cartBadgeText}>{cartItemsCount}</AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSection = (title: string, data: any[], showViewAll = false) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="medium" style={styles.sectionTitle}>{title}</AppText>
        {showViewAll && (
          <TouchableOpacity onPress={() => navigation.navigate(StackNames.ProductListScreen, { query: 'all' })}>
            <AppText style={styles.viewAllText}>View All</AppText>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={data}
        renderItem={renderProduct}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
      />
    </View>
  );

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToAppConfig((config: any) => {
      console.log("App Config:", config);
      if (config) setConfig(config);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <LinearGradient
      style={styles.container}
      colors={topBarBackgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        <StatusBar barStyle={'default'} />
        <View style={styles.container}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {renderHeader()}
            {
              topBarBrandLogo && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', paddingBottom: 5 }}>
                  <TouchableOpacity
                    style={[styles.locationButton, { width: '92%', flexDirection: 'row', justifyContent: 'space-between' }]}
                    onPress={() => setShowLocationSelector(true)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={16} color="#333" />
                      <AppText variant="small" style={{ maxWidth: 280, marginHorizontal: scale(5) }} numberOfLines={1} ellipsizeMode="tail">
                        {getSelectedLocation(selectedLocation)}
                      </AppText>
                    </View>
                    <ChevronDown size={16} color="#333" />
                  </TouchableOpacity>
                </View>
              )
            }
            <ScrollView style={{ flex: 1, backgroundColor: Colors.ScreenBGColor }} showsVerticalScrollIndicator={false} contentContainerStyle={{
              paddingBottom: 85
            }}>
              {
                isVisibleSlider && (
                  <>
                    {loading.banners ? (
                      <View style={styles.loadingBanner}>
                        <AppText style={styles.loadingText}>Loading banners...</AppText>
                      </View>
                    ) : (
                      <BannerCarousel banners={banners} />
                    )}
                  </>
                )
              }

              {/* Ads */}
              <View style={{ marginBottom: verticalScale(10) }}>
                {
                  homeScreenAds.map((bannerImg: any, index: number) => (
                    <TouchableOpacity activeOpacity={0.8} key={index + 1}>
                      <AutoHeightImage
                        uri={bannerImg}
                      />
                    </TouchableOpacity>
                  ))
                }
              </View>

              {
                isVisibleCategorySection && (
                  <View style={[styles.section, { paddingHorizontal: 20, marginBottom: 20 }]}>
                    <AppText variant="medium" style={[styles.sectionTitle, { marginBottom: 10 }]}>Shop by Category</AppText>
                    {loading.categories ? (
                      <View style={styles.loadingContainer}>
                        <AppText style={styles.loadingText}>Loading categories...</AppText>
                      </View>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoriesContainer}
                      >
                        {categories.map((category: any) => (
                          <CategoryCard navigation={navigation} key={category.id} category={category} />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )
              }

              {loading.products ? (
                <View style={styles.loadingContainer}>
                  <AppText style={styles.loadingText}>Loading products...</AppText>
                </View>
              ) : (
                <>
                  {newArrivals.length > 0 && renderSection('New Arrivals', newArrivals, true)}
                  {bestSellers.length > 0 && renderSection('Best Sellers', bestSellers, true)}
                  {renderSection('Featured Products', featuredProducts, true)}
                </>
              )}

              <View style={{ backgroundColor: '#f8f8f8', width: '100%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}>
                <AppText style={{ fontSize: scale(50), fontWeight: 'bold', opacity: 0.2 }}>Screw Plus</AppText>
                <AppText variant="small" style={{ opacity: 0.2, marginTop: 5 }}>Developed By ❤️ Murliwala Enterprises</AppText>
              </View>
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
    paddingRight: 16,
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
    // paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  locationText: {
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 6,
  },
  welcomeText: {
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
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
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
    color: '#6B7280',
  },
});