
import { ArrowLeft, Heart, Share2, ShoppingCart, Star } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { firebaseService } from '../../services/firebaseService';
import { getDiscountPercentage, getProductVariant } from '../../services/utilityService';
import { Colors } from '../../constants/Colors';
import { StackNames } from '../../constants/stackNames';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function ProductDetailScreen({ navigation, route }: any) {
  const { getCartItemsCount, cart } = useStore();
  const { productId } = route.params;
  const { favorites, toggleFavorite, addToCart } = useStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<any>({});

  const [showFullDesc, setShowFullDesc] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const cartItemsCount = getCartItemsCount();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      const data = await firebaseService.getProductById(productId as string);
      if (!data) {
        setError("Product not found");
      } else {
        if (!Object.keys(selectedOptions).length) {
          const variant = getProductVariant(data);
          setSelectedOptions((prev: any) => ({
            ...prev,
            ...variant
          }));
        }
        console.log('Fetched product:', data);
        setProduct(data);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const isFavorite = product && favorites.includes(product.id);

  const handleAddToCart = () => {
    if (!selectedOptions.size || !selectedOptions.color) {
      Alert.alert('Please select size and color');
      return;
    }
    const cartResult = addToCart(product, selectedOptions.size, selectedOptions.color);
    if (cartResult !== null) {
      Alert.alert('Added to cart!');
      Vibration.vibrate(500);
    }
  };

  const handleBuyNow = () => {
    const existingItem = cart.find(
      (item) =>
        item.product.id === product.id &&
        item.selectedSize === selectedOptions.size &&
        item.selectedColor === selectedOptions.color
    );

    const cartResult = addToCart(product, selectedOptions.size, selectedOptions.color);

    if (cartResult !== null) {
      if (existingItem) {
        navigation.navigate(StackNames.Cart);
      } else {
        if (!selectedOptions.size || !selectedOptions.color) {
          Alert.alert('Please select size and color');
          return;
        }

        navigation.navigate(StackNames.Cart);
      }
    }
  };


  const handleShare = async () => {
    try {
      console.log('Sharing product:', product);
      await Share.share({
        message: `Check out this amazing product: ${product.title} - ₹${getProductVariant(product).price}`,
        url: product.image,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>{error || 'Product not found'}</Text>
      </SafeAreaView>
    );
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT * 0.3],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  // const selectedVariant =
  //   product.variants?.find((variant: any) =>
  //     Object.entries(selectedOptions).every(
  //       ([key, value]) => variant[key] === value
  //     )
  //   ) || {};

  // const discount =
  //   selectedOptions?.originalPrice && product.price
  //     ? Math.round(
  //       (((selectedOptions.originalPrice || 0) - product.price) /
  //         (selectedOptions.originalPrice || 1)) * 100
  //     )
  //     : null;

  const handleChangeVariant = (type: string, value: string) => {
    setSelectedOptions((prev: any) => {
      const updatedOptions = {
        ...prev,
        [type]: value
      };

      if (type === "size") {
        updatedOptions.color = "";
      } else if (type === "color") {
        updatedOptions.size = prev.size;
      }

      const variant = product.variants.find(
        (d: any) =>
          d.size === updatedOptions.size &&
          d.color === updatedOptions.color
      );

      return {
        ...updatedOptions,
        ...(variant || {}),
      };
    });
  };

  const isOutOfStock = Number(selectedOptions.stock || 0) === 0;


  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.container}>

        {/* Animated Header */}
        <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <TouchableOpacity style={[styles.floatingButton, { backgroundColor: 'transparent' }]}
                onPress={() => navigation.navigate(StackNames.MainAppStack)}
              >
                <ArrowLeft size={20} color={'#000'} />
              </TouchableOpacity>
              <View style={{ width: 200 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 3 }} numberOfLines={1} ellipsizeMode='tail'>{product.title}</Text>
                {selectedOptions ? (
                  <View style={[styles.priceContainer, { marginBottom: 0 }]}>
                    <Text style={[styles.price, { fontSize: 14, color: 'green' }]}>₹{selectedOptions.price}</Text>
                    {selectedOptions.originalPrice && (
                      <Text style={[styles.originalPrice, { fontSize: 14 }]}>
                        ₹{selectedOptions.originalPrice}
                      </Text>
                    )}
                    {getDiscountPercentage(selectedOptions.originalPrice, selectedOptions.price) > 0 && (
                      <Text style={[styles.discount, { fontSize: 14 }]}>
                        -{getDiscountPercentage(selectedOptions.originalPrice, selectedOptions.price)}% OFF
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.price}>Please select options</Text>
                )}

              </View>
            </View>
            <View style={styles.floatingActions}>
              <TouchableOpacity style={[styles.floatingButton, { backgroundColor: 'transparent' }]} onPress={() => toggleFavorite(product.id)}>
                <Heart
                  size={20}
                  color={isFavorite ? 'red' : '#000'}
                  fill={isFavorite ? 'red' : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.floatingButton, { backgroundColor: 'transparent' }]} onPress={handleShare}>
                <Share2 size={20} color={'#000'} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Floating Header Buttons */}
        <View style={[styles.floatingHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.floatingButton}
            onPress={() => navigation.navigate(StackNames.MainAppStack)}
          >
            <ArrowLeft size={20} color={'#fff'} />
          </TouchableOpacity>
          <View style={styles.floatingActions}>
            <TouchableOpacity
              style={styles.floatingButton} onPress={() => navigation.navigate(StackNames.Cart)}
            >
              <ShoppingCart size={20} color={'#fff'} />
              {cartItemsCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.floatingButton} onPress={() => toggleFavorite(product.id)}>
              <Heart
                size={20}
                color={'#fff'}
                fill={isFavorite ? '#fff' : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.floatingButton} onPress={handleShare}>
              <Share2 size={20} color={'#fff'} />
            </TouchableOpacity>
          </View>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Parallax Image Slider */}
          <View style={styles.imageContainer}>
            <Animated.View
              style={[
                styles.imageSliderContainer,
                {
                  transform: [
                    { translateY: imageTranslateY },
                    { scale: imageScale },
                  ],
                },
              ]}
            >
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                  setCurrentImageIndex(index);
                }}
              >
                {product.images ? product.images.map((img: string, index: number) => (
                  <Image key={index} source={{ uri: img }} style={styles.productImage} />
                )) : <Image source={{ uri: product.image }} style={styles.productImage} />}
              </ScrollView>

              {/* Image Indicators */}
              <View style={styles.imageIndicators}>
                {product?.images?.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentImageIndex && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </Animated.View>
          </View>

          <View style={styles.content}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.title}>{product.title}</Text>

            <View style={styles.ratingContainer}>
              <Star size={16} color="#ffa502" fill="#ffa502" />
              <Text style={styles.rating}>
                {product.rating}
              </Text>

              <Text style={styles.reviews}>
                ({String(product.reviews)} reviews)
              </Text>
            </View>

            {selectedOptions ? (
              <View style={styles.priceContainer}>
                <Text style={styles.price}>₹{selectedOptions.price}</Text>
                {selectedOptions.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{selectedOptions.originalPrice}
                  </Text>
                )}
                {getDiscountPercentage(selectedOptions.originalPrice, selectedOptions.price) > 0 && (
                  <Text style={styles.discount}>
                    -{getDiscountPercentage(selectedOptions.originalPrice, selectedOptions.price)}% OFF
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.price}>Please select options</Text>
            )}


            {
              isOutOfStock && (
                <Text style={{ marginBottom: 20, fontSize: 18, fontWeight: '500', color: Colors.light.danger }}>Out of stock</Text>
              )
            }

            {/* Variants - Sizes */}
            {product?.variants?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sizes</Text>
                <View style={styles.optionsRow}>
                  {[...new Set(product.variants.map((v: any) => v.size))].map(
                    (size: any, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.option,
                          selectedOptions.size === size && styles.optionSelected
                        ]}
                        onPress={() => handleChangeVariant('size', size)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedOptions.size === size && styles.optionTextSelected
                          ]}
                        >
                          {size}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Variants - Colors */}
            {product?.variants?.length > 0 && selectedOptions.size && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Colors</Text>
                {/* <View style={styles.optionsRow}>
                  {product.variants
                    .filter((variant: any) => variant.size === selectedOptions.size)
                    .map((variant: any, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.option,
                          selectedOptions.color === variant.color && styles.optionSelected
                        ]}
                        onPress={() => handleChangeVariant('color', variant.color)
                        }
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedOptions.color === variant.color && styles.optionTextSelected
                          ]}
                        >
                          {variant.color}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View> */}


                <View style={styles.optionsRow}>
                  {[...new Set(product.variants.filter((variant: any) => variant.size === selectedOptions.size).map((v: any) => v.color))].map(
                    (color: any, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.option,
                          selectedOptions.color === color && styles.optionSelected
                        ]}
                        onPress={() => handleChangeVariant('color', color)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedOptions.color === color && styles.optionTextSelected
                          ]}
                        >
                          {color}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}



            {/* Attributes */}
            {Array.isArray(product.attributes) && product.attributes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specifications</Text>
                {product.attributes.map((attr: any, index: number) => (
                  <View key={index} style={styles.attrRow}>
                    <Text style={styles.attrKey}>{attr.key}</Text>
                    <Text style={styles.attrValue}>{attr.value}</Text>
                  </View>
                ))}
              </View>
            )}


            {/* Description */}
            {product.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
                  <Text style={styles.description} numberOfLines={showFullDesc ? undefined : 2} ellipsizeMode='tail'>{product.description}</Text>
                  <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}><Text style={{ color: Colors.light.link, fontWeight: '500' }}>{showFullDesc ? 'Hide' : 'More'}</Text></TouchableOpacity>
                </View>
              </View>
            )}


            {/* Reviews */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviews.length === 0 ? (
                <Text style={{ color: '#6B7280' }}>No reviews yet</Text>
              ) : (
                <FlatList
                  data={reviews}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <Text style={styles.reviewUser}>{item.user}</Text>
                        <View style={styles.starsRow}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} color={i < item.rating ? '#F59E0B' : '#D1D5DB'} fill={i < item.rating ? '#F59E0B' : 'none'} />
                          ))}
                        </View>
                      </View>
                      <Text style={styles.reviewText}>{item.comment}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          </View>

        </Animated.ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.addToCartButton, { opacity: isOutOfStock ? 0.2 : 1 }]} onPress={handleAddToCart} disabled={isOutOfStock}>
            <ShoppingCart size={20} color="#333" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buyNowButton, { opacity: isOutOfStock ? 0.2 : 1 }]} onPress={handleBuyNow} disabled={isOutOfStock}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 400,
    overflow: 'hidden',
  },
  imageSliderContainer: {
    height: 400,
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: 400,
    resizeMode: 'contain',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(107, 108, 110, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: Colors.light.primary,
    width: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
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
  content: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 26,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  discount: {
    fontSize: 14,
    color: Colors.light.danger,
    fontWeight: '500',
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    marginLeft: 8,
  },
  buyNowText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fafafa',
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#dedede',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    zIndex: 999,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    // backdropFilter: 'blur(10px)',
  },
  floatingActions: {
    flexDirection: 'row',
    gap: 12,
  },


  // New
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 34,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  specKey: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 16,
    color: '#94A3B8',
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  deliveryInfo: {
    marginTop: 8,
  },
  deliveryText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  policyText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginTop: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#dedede',
  },
  quantityButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },


  priceRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  option: { borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  optionSelected: { backgroundColor: '#333', borderColor: '#333' },
  attrRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  attrKey: { fontWeight: '600', color: '#374151', maxWidth: '40%' },
  attrValue: { color: '#6B7280', maxWidth: '60%', textAlign: 'left', flex: 1 },

  reviewCard: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewUser: { fontWeight: '600', color: '#111827' },
  starsRow: { flexDirection: 'row' },
  reviewText: { marginTop: 4, color: '#374151' },
  reviewBtn: { marginTop: 10, padding: 10, backgroundColor: '#333', borderRadius: 6, alignItems: 'center' },
  reviewBtnText: { color: '#fff', fontWeight: '600' },
});