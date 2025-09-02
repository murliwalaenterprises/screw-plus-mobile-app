import { CartItem, Product } from '../types/product';
import { create } from 'zustand';

// export interface Order {
//   id: string;
//   items: CartItem[];
//   total: number;
//   status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
//   orderDate: Date;
//   deliveryAddress: string;
//   paymentMethod: string;
// }

interface StoreState {
  cart: CartItem[];
  favorites: string[];
  // orders: Order[];
  wishlist: Product[];
  searchQuery: string;
  selectedCategory: any;

  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;

  toggleFavorite: (productId: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;

  // addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: any) => void;

  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  favorites: [],
  orders: [],
  wishlist: [],
  searchQuery: '',
  selectedCategory: 'All',

  addToCart: (product, size, color, quantity = 1) => {
    set((state) => {
      const existingItemIndex = state.cart.findIndex(
        item => item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += quantity;
        return { cart: updatedCart };
      } else {
        return {
          cart: [...state.cart, { product, quantity, selectedSize: size, selectedColor: color }]
        };
      }
    });
  },

  removeFromCart: (productId, size, color) => {
    set((state) => ({
      cart: state.cart.filter(
        item => !(item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color)
      )
    }));
  },

  updateCartQuantity: (productId, size, color, quantity) => {
    set((state) => ({
      cart: state.cart.map(item =>
        item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    }));
  },

  clearCart: () => set({ cart: [] }),

  toggleFavorite: (productId) => {
    set((state) => ({
      favorites: state.favorites.includes(productId)
        ? state.favorites.filter(id => id !== productId)
        : [...state.favorites, productId]
    }));
  },

  addToWishlist: (product) => {
    set((state) => {
      const exists = state.wishlist.find(item => item.id === product.id);
      if (!exists) {
        return { wishlist: [...state.wishlist, product] };
      }
      return state;
    });
  },

  removeFromWishlist: (productId) => {
    set((state) => ({
      wishlist: state.wishlist.filter(item => item.id !== productId)
    }));
  },

  clearWishlist: () => set({ wishlist: [], favorites: [] }),

  // addOrder: (orderData) => {
  //   set((state) => ({
  //     orders: [...state.orders, {
  //       ...orderData,
  //       id: Date.now().toString(),
  //       orderDate: new Date()
  //     }]
  //   }));
  // },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getCartTotal: () => {
    const { cart } = get();

    return cart.reduce((total, item) => {
      const selectedVariant = item.product.variants.find(
        (variant: any) =>
          variant.size === item.selectedSize &&
          variant.color === item.selectedColor
      );

      const price = selectedVariant ? selectedVariant.price : item.product.price;

      return total + price * item.quantity;
    }, 0);
  },

  getCartItemsCount: () => {
    const { cart } = get();
    // return cart.reduce((total, item) => total + item.quantity, 0);
    return cart.length;
  }

}));