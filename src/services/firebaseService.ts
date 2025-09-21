import { db } from '../config/firebase';
import { Banner, Category, Product } from '../types/product';
import { Address, Order } from '../types/types';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc
} from 'firebase/firestore';

export interface FirebaseProduct extends Omit<Product, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseCategory extends Omit<Category, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseBanner extends Omit<Banner, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  order: number;
}

class FirebaseService {
  // Products
  async getProducts(): Promise<Product[]> {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(oDoc => ({
      id: oDoc.id,
      ...oDoc.data()
    })) as Product[];
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<string> {
    const productsRef = collection(db, 'products');
    const now = Timestamp.now();
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...product,
      updatedAt: Timestamp.now()
    });
  }

  async deleteProduct(id: string): Promise<void> {
    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(oDoc => ({
      id: oDoc.id,
      ...oDoc.data()
    })) as Category[];
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    const categoriesRef = collection(db, 'categories');
    const now = Timestamp.now();
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<void> {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, {
      ...category,
      updatedAt: Timestamp.now()
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
  }

  // Banners
  async getBanners(): Promise<Banner[]> {
    const bannersRef = collection(db, 'banners');
    const q = query(bannersRef, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(oDoc => ({
      id: oDoc.id,
      ...oDoc.data()
    })) as Banner[];
  }

  async addBanner(banner: Omit<Banner, 'id'> & { isActive?: boolean; order?: number }): Promise<string> {
    const bannersRef = collection(db, 'banners');
    const now = Timestamp.now();
    const docRef = await addDoc(bannersRef, {
      ...banner,
      isActive: banner.isActive ?? true,
      order: banner.order ?? 0,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  async updateBanner(id: string, banner: Partial<Banner & { isActive?: boolean; order?: number }>): Promise<void> {
    const bannerRef = doc(db, 'banners', id);
    await updateDoc(bannerRef, {
      ...banner,
      updatedAt: Timestamp.now()
    });
  }

  async deleteBanner(id: string): Promise<void> {
    const bannerRef = doc(db, 'banners', id);
    await deleteDoc(bannerRef);
  }

  // Real-time listeners
  subscribeToProducts(callback: (products: Product[]) => void) {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(oDoc => ({
        id: oDoc.id,
        ...oDoc.data()
      })) as Product[];
      callback(products);
    });
  }

  subscribeToCategories(callback: (categories: Category[]) => void) {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, orderBy('name'));
    return onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(oDoc => ({
        id: oDoc.id,
        ...oDoc.data()
      })) as Category[];
      callback(categories);
    });
  }

  subscribeToBanners(callback: (banners: Banner[]) => void) {
    const bannersRef = collection(db, 'banners');
    const q = query(bannersRef, orderBy('order'));
    return onSnapshot(q, (snapshot) => {
      const banners = snapshot.docs.map(oDoc => ({
        id: oDoc.id,
        ...oDoc.data()
      })) as Banner[];
      callback(banners);
    });
  }

  // Inside class FirebaseService
  async getProductById(id: string): Promise<Product | null> {
    try {
      const productRef = doc(db, 'products', id);
      const snapshot = await getDoc(productRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Product;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  // Address
  async getAddresses(userId: string): Promise<Address[]> {
    const addressesRef = collection(db, `users/${userId}/addresses`);
    const snapshot = await getDocs(addressesRef);
    return snapshot.docs.map(oDoc => ({
      id: oDoc.id,
      ...oDoc.data(),
    })) as Address[];
  }

  async addAddress(userId: string, address: Omit<Address, 'id'>): Promise<string> {
    const addressesRef = collection(db, `users/${userId}/addresses`);
    const docRef = await addDoc(addressesRef, address);
    return docRef.id;
  }

  async updateAddress(userId: string, id: string, address: Partial<Address>): Promise<void> {
    const addressRef = doc(db, `users/${userId}/addresses`, id);
    await updateDoc(addressRef, address);
  }

  async deleteAddress(userId: string, id: string): Promise<void> {
    const addressRef = doc(db, `users/${userId}/addresses`, id);
    await deleteDoc(addressRef);
  }

  subscribeToAddresses(userId: string, callback: (addresses: Address[]) => void) {
    const addressesRef = collection(db, `users/${userId}/addresses`);
    return onSnapshot(addressesRef, (snapshot) => {
      const addresses = snapshot.docs.map(oDoc => ({
        id: oDoc.id,
        ...oDoc.data(),
      })) as Address[];
      callback(addresses);
    });
  }

  // ========== Reviews ==========
  async getReviews(productId: string) {
    const reviewsRef = collection(db, `products/${productId}/reviews`);
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(oDoc => ({
      id: oDoc.id,
      ...oDoc.data(),
    }));
  }

  async addReview(
    productId: string,
    review: { userId: string; userName: string; rating: number; comment: string }
  ): Promise<string> {
    const reviewsRef = collection(db, `products/${productId}/reviews`);
    const now = Timestamp.now();
    const docRef = await addDoc(reviewsRef, {
      ...review,
      createdAt: now,
    });
    return docRef.id;
  }

  subscribeToReviews(
    productId: string,
    callback: (reviews: any[]) => void
  ) {
    const reviewsRef = collection(db, `products/${productId}/reviews`);
    const q = query(reviewsRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(oDoc => ({
        id: oDoc.id,
        ...oDoc.data(),
      }));
      callback(reviews);
    });
  }

  // Order
  async getOrders(userId: string): Promise<Order[]> {
    const orderRef = collection(db, `users/${userId}/orders`);
    const snapshot = await getDocs(orderRef);

    return snapshot.docs.map(oDoc => {
      const data = oDoc.data() as Omit<Order, "id">; // Exclude id since it's from doc.id
      return {
        id: oDoc.id,
        ...data,
      };
    });
  }

  async addOrder(userId: string, order: Omit<Order, 'id'>): Promise<string> {
    // 1. Save order
    const orderRef = collection(db, `users/${userId}/orders`);
    const now = Timestamp.now();
    const docRef = await addDoc(orderRef, {
      ...order,
      createdAt: now,
      updatedAt: now
    });

    // 2. Loop through items to update stock
    for (const item of order.items) {
      const productRef = doc(db, `products/${item.productId}`);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        const variants = productData.variants || [];

        // Find matching variant by size + color
        const updatedVariants = variants.map((v: any) => {
          if (v.size === item.size && v.color === item.color) {
            const newStock = (v.stock || 0) - item.quantity;
            if (newStock < 0) {
              throw new Error(`Not enough stock for ${item.productId}`);
            }
            return { ...v, stock: newStock };
          }
          return v;
        });

        // Update product with new variants array
        await updateDoc(productRef, { variants: updatedVariants });
      }
    }
    return docRef.id;
  }

  async updateOrder(userId: string, id: string, order: Partial<Order>): Promise<void> {
    const now = Timestamp.now();
    const orderRef = doc(db, `users/${userId}/orders`, id);
    await updateDoc(orderRef, { ...order, updatedAt: now });
  }

  async deleteOrder(userId: string, id: string): Promise<void> {
    const orderRef = doc(db, `users/${userId}/orders`, id);
    await deleteDoc(orderRef);
  }

  subscribeToOrder(userId: string, callback: (orders: Order[]) => void) {
    const orderRef = collection(db, `users/${userId}/orders`);
    return onSnapshot(orderRef, (snapshot) => {
      const orders = snapshot.docs.map(oDoc => ({
        id: oDoc.id,
        ...oDoc.data(),
      })) as Order[];
      callback(orders);
    });
  }

  // Admin: Get all orders across all users
  subscribeToAllOrders(
    callback: (orders: (Order & { userId: string })[]) => void
  ) {
    const ordersRef = collectionGroup(db, "orders");

    return onSnapshot(ordersRef, (snapshot) => {
      const orders = snapshot.docs.map((oDoc) => {
        const data = oDoc.data() as Omit<Order, "id">;
        const pathParts = oDoc.ref.path.split("/"); // "users/{userId}/orders/{orderId}"
        const userId = pathParts[1]; // extract userId

        return {
          id: oDoc.id,
          userId,
          ...data,
        };
      });
      console.log("All Orders:", orders);
      callback(orders);
    });
  }

  // Users

  subscribeToUser(userId: string, callback: (user: any) => void) {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot?.exists()) {
        const user = {
          id: snapshot?.id,
          ...snapshot?.data(),
        };
        callback(user);
      } else {
        console.log("User not found");
        callback(null);
      }
    });
  }
  subscribeToAppConfig(callback: (config: any) => void) {
    const id = 'cHThTqgAD0e1TpRQej1Y';
    const userRef = doc(db, "appConfig", id);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot?.exists()) {
        const config = {
          id: snapshot?.id,
          ...snapshot?.data(),
        };
        callback(config);
      } else {
        console.log("Config not found");
        callback(null);
      }
    });
  }

}

export const firebaseService = new FirebaseService();