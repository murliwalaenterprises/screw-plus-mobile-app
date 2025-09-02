import { firebaseService } from '../services/firebaseService';
import { Banner, Category, Product } from '../types/product';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';

interface FirebaseDataState {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  loading: {
    products: boolean;
    categories: boolean;
    banners: boolean;
  };
  error: string | null;
  
  // Actions
  refreshData: () => void;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBanner: (banner: Omit<Banner, 'id'>) => Promise<void>;
  updateBanner: (id: string, banner: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
}

export const [FirebaseDataProvider, useFirebaseData] = createContextHook(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState({
    products: true,
    categories: true,
    banners: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeProducts: (() => void) | undefined;
    let unsubscribeCategories: (() => void) | undefined;
    let unsubscribeBanners: (() => void) | undefined;

    try {
      // Subscribe to products
      unsubscribeProducts = firebaseService.subscribeToProducts((data) => {
        setProducts(data);
        setLoading(prev => ({ ...prev, products: false }));
      });

      // Subscribe to categories
      unsubscribeCategories = firebaseService.subscribeToCategories((data) => {
        setCategories(data);
        setLoading(prev => ({ ...prev, categories: false }));
      });

      // Subscribe to banners
      unsubscribeBanners = firebaseService.subscribeToBanners((data) => {
        setBanners(data);
        setLoading(prev => ({ ...prev, banners: false }));
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setLoading({ products: false, categories: false, banners: false });
    }

    return () => {
      unsubscribeProducts?.();
      unsubscribeCategories?.();
      unsubscribeBanners?.();
    };
  }, []);

  const refreshData = async () => {
    setLoading({ products: true, categories: true, banners: true });
    setError(null);
    
    try {
      const [productsData, categoriesData, bannersData] = await Promise.all([
        firebaseService.getProducts(),
        firebaseService.getCategories(),
        firebaseService.getBanners()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setBanners(bannersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading({ products: false, categories: false, banners: false });
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await firebaseService.addProduct(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      throw err;
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await firebaseService.updateProduct(id, product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await firebaseService.deleteProduct(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await firebaseService.addCategory(category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw err;
    }
  };

  const updateCategory = async (id: string, category: Partial<Category>) => {
    try {
      await firebaseService.updateCategory(id, category);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await firebaseService.deleteCategory(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  };

  const addBanner = async (banner: Omit<Banner, 'id'>) => {
    try {
      await firebaseService.addBanner(banner);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add banner');
      throw err;
    }
  };

  const updateBanner = async (id: string, banner: Partial<Banner>) => {
    try {
      await firebaseService.updateBanner(id, banner);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update banner');
      throw err;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      await firebaseService.deleteBanner(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
      throw err;
    }
  };

  return {
    products,
    categories,
    banners,
    loading,
    error,
    refreshData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addBanner,
    updateBanner,
    deleteBanner
  } as FirebaseDataState;
});