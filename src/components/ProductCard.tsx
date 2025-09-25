/* eslint-disable @typescript-eslint/no-unused-vars */
import { Heart, ShoppingCartIcon, Star } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useStore } from '../store/useStore';
import { Product } from '../types/product';
import { formatCurrency, getProductVariant } from '../services/utilityService';
import { StackNames } from '../constants/StackNames';
import { Colors } from '../constants/Colors';
import { AppText } from './ui';

interface ProductCardProps {
  navigation: any;
  product: Product;
  width?: number;
  showCartButton?: boolean;
}

export default function ProductCard({ navigation, product, width, showCartButton }: ProductCardProps) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const isFavorite = favorites.includes(product.id);

  const handlePress = () => {
    navigation.navigate(StackNames.ProductDetails, { productId: product.id });
  };

  const handleFavoritePress = () => {
    toggleFavorite(product.id);
  };

  const handleAddToCart = () => {
    const cartResult = addToCart(product, product.variants[0].size, product.variants[0].color);
    if (cartResult !== null) {
      Vibration.vibrate(500);
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { width }]} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image source={product.image ? { uri: product.image } : require('../assets/images/default-product-image.png')} style={styles.image} />
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
          <Heart
            size={moderateScale(16)}
            color={isFavorite ? '#ff4757' : '#999'}
            fill={isFavorite ? '#ff4757' : 'transparent'}
          />
        </TouchableOpacity>

        {/* {product.discount ? (
          <View style={[styles.badge, styles.discountBadge]}>
            <AppText variant="tiny" style={styles.badgeText}>{product.discount}% OFF</AppText>
          </View>
        ) : null} */}
        {product.isNew ? (
          <View style={[styles.badge, styles.newBadge]}>
            <AppText variant="tiny" style={styles.badgeText}>NEW</AppText>
          </View>
        ) : null}

        {/* {product.isNew ? (
          <View style={[styles.badge, styles.newBadge, { bottom: verticalScale(product.isBestseller ? 30 : 10) }]}>
            <AppText variant="tiny" style={styles.badgeText}>NEW</AppText>
          </View>
        ) : null} */}

        {product.isBestseller ? (
          <View style={[styles.badge, styles.bestsellerBadge]}>
            <AppText variant="tiny" style={styles.badgeText}>BESTSELLER</AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <AppText variant="small" style={styles.brand}>{product.brand}</AppText>
        <AppText variant="small" style={styles.title} numberOfLines={2} ellipsizeMode='tail'>
          {product.title}
        </AppText>

        <View style={styles.ratingContainer}>
          <Star size={moderateScale(14)} color="#ffa502" fill="#ffa502" />
          <AppText variant="small" style={styles.rating}>{product.rating}</AppText>
          <AppText variant="small" style={styles.reviews}>({product.reviews})</AppText>
        </View>

        <View style={styles.priceContainer}>
          <AppText style={styles.price}>{formatCurrency(getProductVariant(product).price)}</AppText>
          {getProductVariant(product).originalPrice !== getProductVariant(product).price && (
            <AppText style={styles.originalPrice} variant="small">
              {formatCurrency(getProductVariant(product).originalPrice)}
            </AppText>
          )}
        </View>

        {/* Add to Cart */}
        {
          showCartButton && (
            <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
              <AppText variant="small" style={styles.cartBtnText}>Add to cart</AppText>
            </TouchableOpacity>
          )
        }
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f3f3f3ff'
  },
  image: {
    width: '100%',
    height: verticalScale(100),
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    objectFit: 'cover'
  },
  favoriteButton: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: moderateScale(20),
    padding: moderateScale(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: verticalScale(10),
    left: scale(10),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  discountBadge: {
    backgroundColor: '#ff6b81',
  },
  newBadge: {
    backgroundColor: '#2ed573',
    // top: undefined,
    // bottom: verticalScale(10),
  },
  bestsellerBadge: {
    backgroundColor: '#ffa502',
    top: undefined,
    bottom: verticalScale(10),
    left: scale(10),
  },
  badgeText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: scale(12),
  },
  brand: {
    color: '#888',
    marginBottom: verticalScale(2),
  },
  title: {
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(6),
    lineHeight: verticalScale(18),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  rating: {
    color: '#333',
    marginLeft: scale(4),
    fontWeight: '500',
  },
  reviews: {
    color: '#888',
    marginLeft: scale(4),
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontWeight: '600',
    color: 'green',
  },
  originalPrice: {
    color: '#aaa',
    textDecorationLine: 'line-through',
    marginLeft: scale(8),
  },
  cartBtn: {
    backgroundColor: Colors.light.primaryButtonBackground.start,
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(4),
    alignItems: "center",
    marginTop: verticalScale(10),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(5),
  },
  cartBtnText: {
    color: Colors.light.primaryButtonForeground,
  },
});
