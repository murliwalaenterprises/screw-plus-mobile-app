
import { ShoppingCart, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { firebaseService } from '../../services/firebaseService';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import { StackNames } from '../../constants/stackNames';

export default function CategoriesScreen({navigation}: any) {
  const { selectedCategory, setSelectedCategory, getCartItemsCount } = useStore();
  const [activeCategory, setActiveCategory] = useState({ "color": "#f0f0f0", "count": 0, "id": "all", "name": "All" });
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const cartItemsCount = getCartItemsCount();

  // Fetch categories & products from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoryData, productData] = await Promise.all([
          firebaseService.getCategories(),
          firebaseService.getProducts()
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

  const categoryOptions = [{
    id: 'all',
    name: 'All',
    count: products.length,
    color: '#f0f0f0',
  }, ...categories];

  const filteredProducts =
    (!activeCategory.id || activeCategory.id === 'all')
      ? products
      : products.filter(product => product.category === activeCategory.name);

  // const handleCategoryPress = (category: string) => {
  //   setActiveCategory(category);
  //   setSelectedCategory(category);
  // };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productContainer}>
      <ProductCard product={item} />
    </View>
  );

  // const renderCategoryFilter = ({ item }: { item: string }) => (
  //   <TouchableOpacity
  //     style={[
  //       styles.categoryFilter,
  //       activeCategory === item && styles.categoryFilterActive
  //     ]}
  //     onPress={() => handleCategoryPress(item)}
  //   >
  //     <Text
  //       style={[
  //         styles.categoryFilterText,
  //         activeCategory === item && styles.categoryFilterTextActive
  //       ]}
  //     >
  //       {item}
  //     </Text>
  //   </TouchableOpacity>
  // );

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
      {
        item.image ? (
          <View style={styles.subcategoryImageContainer}>
            <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
          </View>
        ) : (
          <Sparkles size={24} color={Colors.light.homeScreenHeaderForeground} />
        )
      }
      <Text
        style={[
          styles.categoryText,
          activeCategory.id === item.id && styles.activeCategoryText,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // const renderSubcategory = ({ item }: any) => (
  //   <View style={[styles.subcategoryBox, { backgroundColor: item.color }]}>
  //     <Image source={{ uri: item.image }} style={styles.subcategoryImage} />
  //     <Text style={styles.subcategoryName}>{item.name}</Text>
  //     <View style={styles.subcategoryCountBadge}>
  //       <Text style={styles.badgeText}>{item.count}</Text>
  //     </View>
  //   </View>
  // );

  return (
    <LinearGradient
      colors={[Colors.light.homeScreenHeaderBackground.start, Colors.light.homeScreenHeaderBackground.end]}  // gradient colors
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}  // gradient start point
      end={{ x: 1, y: 0 }}    // gradient end point
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Categories</Text>
            <Text style={styles.subtitle}>{filteredProducts.length} products found</Text>
          </View>
          <View>
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
        <View style={styles.container}>

          {/* Left category list */}
          <FlatList
            data={categoryOptions}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            style={styles.leftMenu}
          />

          {/* Right subcategory grid */}
          <FlatList
            data={(!activeCategory.id || activeCategory.id === 'all') ? products : products.filter(product => product.category === activeCategory.name)}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.subcategoryContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* {
            false && (
              <>
                <FlatList
                  data={categoryOptions}
                  renderItem={renderCategoryFilter}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryFilters}
                  contentContainerStyle={styles.categoryFiltersContent}
                />

                <FlatList
                  data={filteredProducts}
                  renderItem={renderProduct}
                  numColumns={2}
                  columnWrapperStyle={styles.row}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.productsContainer}
                  keyExtractor={item => item.id}
                />
              </>
            )
          } */}

          {/* New UI */}

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    width: '100%'
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
  categoryFilters: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 52,
    maxHeight: 52,
  },
  categoryFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryFilter: {
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryFilterActive: {
    backgroundColor: '#333',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: '#fff',
  },
  productsContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },


  // New UI styles
  leftMenu: {
    maxWidth: '25%',
    backgroundColor: '#ccc2',
    borderRightWidth: 1,
    borderRightColor: '#dedede',
  },
  categoryItem: {
    paddingVertical: 10,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  activeCategoryItem: {
    backgroundColor: '#fff',
    borderLeftWidth: 5,
    borderLeftColor: Colors.light.primaryButtonBackground.end,
  },
  categoryText: {
    fontSize: 16,
    color: '#888',
    marginTop: 6,
  },
  activeCategoryText: {
    fontWeight: '500',
    color: Colors.light.primaryButtonBackground.end,
  },
  subcategoryContainer: {
    maxWidth: '100%',
    flexGrow: 1,
    padding: 8
  },
  subcategoryBox: {
    flex: 1,
    margin: 2,
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  subcategoryImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#fff',
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    objectFit: 'cover',
    resizeMode: 'cover',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  subcategoryName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  subcategoryCountBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    elevation: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
