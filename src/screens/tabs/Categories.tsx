/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ShoppingCart, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { firebaseService } from '../../services/firebaseService';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import { StackNames } from '../../constants/StackNames';
import { scale, verticalScale } from 'react-native-size-matters';
import { IconConfig } from '../../constants/Constant';
import { AppText } from '../../components/ui';
import { useAppConfig } from '../../store/useAppConfig';

const screenWidth = Dimensions.get('window').width;

export default function CategoriesScreen({ navigation }: any) {
  const { topBarBackgroundColor, topBarForegroundColor }: any = useAppConfig();

  const { selectedCategory, setSelectedCategory, getCartItemsCount } = useStore();
  const [activeCategory, setActiveCategory] = useState({
    color: '#f0f0f0',
    count: 0,
    id: 'all',
    name: 'All',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cartItemsCount = getCartItemsCount();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoryData, productData] = await Promise.all([
          firebaseService.getCategories(),
          firebaseService.getProducts(),
        ]);

        setCategories(categoryData);
        setProducts(productData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryOptions = [
    {
      id: 'all',
      name: 'All',
      count: products.length,
      color: '#f0f0f0',
    },
    ...categories,
  ];

  const filteredProducts =
    !activeCategory.id || activeCategory.id === 'all'
      ? products
      : products.filter((product) => product.category === activeCategory.name);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </SafeAreaView>
    );
  }

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard navigation={navigation} product={item} width={(screenWidth * 0.8) / 2 - 14} showCartButton />
  );

  const NoProductFound = () => (
    <View style={styles.noProductContainer}>
      <AppText style={styles.noProductText}>No Product Found</AppText>
    </View>
  );

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={topBarBackgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View>
            <AppText style={[styles.title, { color: topBarForegroundColor }]}>Categories</AppText>
            <AppText style={[styles.subtitle, { color: topBarForegroundColor }]}>
              {filteredProducts.length} products found
            </AppText>
          </View>
          <View>
            <TouchableOpacity
              style={[styles.headerButton, styles.cartButton]}
              onPress={() => navigation.navigate(StackNames.Cart)}>
              <ShoppingCart
                size={IconConfig.size}
                color={topBarForegroundColor}
              />
              {cartItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <AppText style={styles.cartBadgeText}>{cartItemsCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.container}>
          {/* Left sidebar */}
          <ScrollView style={styles.leftMenu} showsVerticalScrollIndicator={false}>
            {categoryOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelectedCategory(item);
                  setActiveCategory(item);
                }}
                style={[
                  styles.categoryItem,
                  activeCategory.id === item.id && styles.activeCategoryItem,
                ]}>
                {item.image ? (
                  <View style={styles.subcategoryImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
                  </View>
                ) : (
                  <Sparkles size={scale(20)} color={activeCategory.id === item.id ? '#222' : '#ccc'} />
                )}
                <AppText
                  variant="small"
                  style={[
                    styles.categoryText,
                    activeCategory.id === item.id && styles.activeCategoryText,
                  ]}>
                  {item.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Products grid */}
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={styles.subcategoryContainer}
            ListEmptyComponent={<NoProductFound />}
            showsVerticalScrollIndicator={false}
            style={styles.productsGrid}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: scale(1),
    flexDirection: 'row',
    width: '100%',
  },
  header: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(11),
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: scale(20), // was 24
    fontWeight: '600',
  },
  subtitle: {
    fontSize: scale(12), // was 14
    opacity: scale(0.7),
    marginTop: scale(2),
  },
  headerButton: {
    padding: scale(8),
    marginLeft: scale(8),
  },
  cartButton: {
    position: 'relative',
    right: -3,
    top: 0
  },
  cartBadge: {
    position: 'absolute',
    top: scale(2),
    right: scale(2),
    backgroundColor: '#ff4757',
    borderRadius: scale(10),
    minWidth: scale(20),
    height: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: scale(10), // was 12
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Left Sidebar
  leftMenu: {
    width: '20%', // was '25%'
    backgroundColor: '#f6f6f6',
    borderRightWidth: 1,
    borderRightColor: '#dedede',
  },

  categoryItem: {
    paddingVertical: scale(10),
    alignItems: 'center',
    paddingHorizontal: scale(6),
  },
  categoryText: {
    color: '#666',
    marginTop: scale(4),
    textAlign: 'center',
  },
  activeCategoryItem: {
    backgroundColor: '#fff',
    borderRightWidth: scale(2),
    borderRightColor: Colors.Primary,
  },
  activeCategoryText: {
    fontWeight: '600',
    color: '#000',
  },

  // Products Grid
  productsGrid: {
    width: '80%', // was '75%'
    backgroundColor: Colors.ScreenBGColor,
  },
  subcategoryContainer: {
    flexGrow: 1,
    padding: scale(10), // was 12
    paddingBottom: scale(120),
  },
  subcategoryImageContainer: {
    width: scale(35),
    height: verticalScale(30),
    borderRadius: scale(100),
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryImage: {
    width: scale(35),
    height: verticalScale(30),
    borderRadius: scale(100),
    resizeMode: 'contain',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noProductContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  noProductText: {
    fontSize: scale(14),
    color: "#999",
    textAlign: "center",
  },
});
