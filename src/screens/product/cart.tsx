/* eslint-disable react-native/no-inline-styles */

import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartItem } from '../../types/product';
import { useStore } from '../../store/useStore';
import { formatCurrency, getDiscountPercentage } from '../../services/utilityService';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../constants/Colors';
import { StackNames } from '../../constants/StackNames';
import { useAuth } from '../../context/AuthContext';
import ScreenHeader from '../../components/ScreenHeader';
import { moderateScale, scale } from 'react-native-size-matters';
import { AppText } from '../../components/ui';

export default function CartScreen({ navigation }: any) {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useStore();
  const { userProfile } = useAuth();
  const isLoggedIn = !!userProfile;

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
    } else {
      updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      navigation.navigate(StackNames.AuthStack);
      return;
    }
    navigation.navigate(StackNames.Checkout);
  }

  const handleRemoveItem = (item: CartItem) => {
    removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const selectedVariant: any = item.product.variants.find(product => product.size === item.selectedSize && product.color === item.selectedColor);
    const isOutOfStock = item.quantity >= Number(selectedVariant?.stock);
    return (
      <View style={styles.cartItem}>
        <Image source={{ uri: item.product.image }} style={styles.itemImage} />

        <View style={styles.itemDetails}>
          <AppText style={styles.itemTitle} numberOfLines={2}>
            {item.product.title}
          </AppText>
          <AppText style={styles.itemVariant}>
            Size: {item.selectedSize} | Color: {item.selectedColor}
          </AppText>
          {selectedVariant ? (
            <View style={styles.priceContainer}>
              <AppText style={styles.price}>{formatCurrency(selectedVariant.price)}</AppText>
              {selectedVariant.originalPrice && (
                <AppText style={styles.originalPrice}>
                  {formatCurrency(selectedVariant.originalPrice)}
                </AppText>
              )}
              {getDiscountPercentage(selectedVariant.originalPrice, selectedVariant.price) > 0 && (
                <AppText style={styles.discount}>
                  -{getDiscountPercentage(selectedVariant.originalPrice, selectedVariant.price)}% OFF
                </AppText>
              )}
            </View>
          ) : (
            <AppText style={styles.price}>Please select options</AppText>
          )}

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item, item.quantity - 1)}
            >
              <Minus size={16} color="#666" />
            </TouchableOpacity>

            <AppText style={styles.quantity}>{item.quantity}</AppText>

            <TouchableOpacity
              style={[styles.quantityButton, { opacity: isOutOfStock ? 0.5 : 1 }]}
              onPress={() => handleQuantityChange(item, item.quantity + 1)}
              disabled={isOutOfStock}
            >
              <Plus size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Trash2 size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    )
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.StatusBarBg }} edges={['top', 'left', 'right']}>
        <ScreenHeader
          title={StackNames.Cart}
          navigation={navigation}
        />
        <View style={styles.container}>
          <View style={styles.emptyContainer}>
            <ShoppingBag size={64} color="#ccc" />
            <AppText style={styles.emptyTitle}>Your cart is empty</AppText>
            <AppText style={styles.emptySubtitle}>
              Add some products to get started
            </AppText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.StatusBarBg }} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={StackNames.Cart}
        navigation={navigation}
      >
        <TouchableOpacity onPress={clearCart}>
          <AppText variant="medium">Clear All</AppText>
        </TouchableOpacity>
      </ScreenHeader>
      <View style={styles.container}>

        <FlatList
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={(item) => `${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cartList}
        />

        <View style={styles.footer}>
          {/* <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12 }}>Exl. Taxes</Text>
              <Text style={styles.totalAmount}>₹{getCartTotal().toFixed(2)}</Text>
            </View>
          </View> */}

          <TouchableOpacity
            onPress={handleCheckout}
          >
            <LinearGradient
              colors={[Colors.light.primaryButtonBackground.start, Colors.light.primaryButtonBackground.end]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 8 }}
            >
              <View style={styles.checkoutButton}>
                <AppText style={styles.checkoutButtonText}>Proceed to Checkout</AppText>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ScreenBGColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
  },
  itemCount: {
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearButton: {
    color: '#ff4757',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#666',
    textAlign: 'center',
  },
  cartList: {
    paddingHorizontal: scale(16),
    paddingTop: scale(30),
    paddingBottom: moderateScale(100)
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemVariant: {
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontWeight: 'bold',
    color: 'green',
  },
  originalPrice: {
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  discount: {
    color: Colors.light.danger,
    fontWeight: '500',
    marginLeft: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantity: {
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: '#333',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    // backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.light.primaryButtonForeground,
    fontWeight: 'bold',
  },
});