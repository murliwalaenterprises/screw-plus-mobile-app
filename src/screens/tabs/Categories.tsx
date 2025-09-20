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
import { StackNames } from '../../constants/stackNames';

const screenWidth = Dimensions.get('window').width;

export default function CategoriesScreen({ navigation }: any) {
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

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
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
        <Sparkles size={24} color={Colors.light.homeScreenHeaderForeground} />
      )}
      <Text
        style={[
          styles.categoryText,
          activeCategory.id === item.id && styles.activeCategoryText,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: any }) => (
   <ProductCard product={item} width={(screenWidth * 0.82) / 2 - 24} />
  );

  return (
    <LinearGradient
      colors={[
        Colors.light.homeScreenHeaderBackground.start,
        Colors.light.homeScreenHeaderBackground.end,
      ]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Categories</Text>
            <Text style={styles.subtitle}>
              {filteredProducts.length} products found
            </Text>
          </View>
          <View>
            <TouchableOpacity
              style={[styles.headerButton, styles.cartButton]}
              onPress={() => navigation.navigate(StackNames.Cart)}>
              <ShoppingCart
                size={24}
                color={Colors.light.homeScreenHeaderForeground}
              />
              {cartItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
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
                  <Sparkles size={24} color={Colors.light.homeScreenHeaderForeground} />
                )}
                <Text
                  style={[
                    styles.categoryText,
                    activeCategory.id === item.id && styles.activeCategoryText,
                  ]}>
                  {item.name}
                </Text>
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
    flex: 1,
    flexDirection: 'row',
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.homeScreenHeaderForeground,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.homeScreenHeaderForeground,
    opacity: 0.8,
    marginTop: 4,
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
    paddingVertical: 14,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  activeCategoryItem: {
    backgroundColor: '#fff',
    borderLeftWidth: 5,
    borderLeftColor: Colors.light.primaryButtonBackground.end,
  },
  categoryText: {
    fontSize: 14,
    color: '#888',
    marginTop: 6,
    textAlign: 'center',
  },
  activeCategoryText: {
    fontWeight: '500',
    color: Colors.light.primaryButtonBackground.end,
  },

  // Products Grid
  productsGrid: {
    width: '80%', // was '75%'
    backgroundColor: '#fff',
  },
  subcategoryContainer: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 40,
  },
  subcategoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
