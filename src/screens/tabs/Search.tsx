
import { Search as SearchIcon, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { firebaseService } from '../../services/firebaseService';
import { useFocusEffect } from '@react-navigation/native';
import ProductCard from '../../components/ProductCard';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../constants/Colors';

export default function Search({navigation, route}: any) {
    const { searchQuery, setSearchQuery } = useStore();
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const data = await firebaseService.getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    useFocusEffect(
        useCallback(() => {
            handleFocus();
        }, [])
    );

    const filteredProducts = useMemo(() => {
        if (!localQuery.trim()) return [];
        return products.filter(product =>
            product.title?.toLowerCase().includes(localQuery.toLowerCase()) ||
            product.category?.toLowerCase().includes(localQuery.toLowerCase()) ||
            product.brand?.toLowerCase().includes(localQuery.toLowerCase())
        );
    }, [localQuery, products]);

    const handleSearchChange = (text: string) => {
        setLocalQuery(text);
        setSearchQuery(text);
    };

    const renderProduct = ({ item }: { item: any }) => (
        <View style={styles.productContainer}>
            <ProductCard product={item} />
        </View>
    );

    const handleFocus = () => {
        inputRef.current?.focus();
        setIsFocused(true);
    };

    const handleBlur = () => {
        inputRef.current?.blur();
        setIsFocused(false);
    };

    const handleCancel = () => {
        handleSearchChange('');
        setIsFocused(false);
        inputRef.current?.blur();
        Keyboard.dismiss();
        navigation.goBack();
    };

    return (
        <LinearGradient
            colors={[Colors.light.homeScreenHeaderBackground.start, Colors.light.homeScreenHeaderBackground.end]}  // gradient colors
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}  // gradient start point
            end={{ x: 1, y: 0 }}    // gradient end point
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'left', 'right']}>
                <View style={styles.searchContainer}>
                    {!isFocused && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ fontSize: 28, fontWeight: '600', color: Colors.light.homeScreenHeaderForeground }}>Search</Text>
                        </View>
                    )}
                    {/* Search bar + cancel */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <View style={[styles.searchInputContainer, { width: isFocused ? '82%' : '100%' }]}>
                            <SearchIcon size={20} color="#666" style={styles.searchIcon} />
                            <TextInput
                                ref={inputRef}
                                style={styles.searchInput}
                                placeholder="Search products..."
                                value={localQuery}
                                onChangeText={handleSearchChange}
                                placeholderTextColor={Colors.light.placeholderTextColor}
                                returnKeyLabel="Search"
                                returnKeyType="search"
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                enablesReturnKeyAutomatically
                            />

                            {localQuery.length > 0 && (
                                <TouchableOpacity onPress={() => {
                                    handleSearchChange('');
                                    handleFocus();
                                }}>
                                    <X size={20} color="#666" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {isFocused && (
                            <TouchableOpacity onPress={handleCancel}>
                                <Text style={{ fontSize: 20, fontWeight: '500', color: Colors.light.homeScreenHeaderForeground }}>Cancel</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={styles.container}>

                    {loading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color="#666" />
                        </View>
                    ) : localQuery.trim() === '' ? (
                        <View style={styles.emptyContainer}>
                            <SearchIcon size={64} color="#ccc" />
                            <Text style={styles.emptyTitle}>Search Products</Text>
                            <Text style={styles.emptySubtitle}>
                                Find your favorite items from our collection
                            </Text>
                        </View>
                    ) : filteredProducts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyTitle}>No products found</Text>
                            <Text style={styles.emptySubtitle}>
                                Try searching with different keywords
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.resultsContainer}>
                            <Text style={styles.resultsText}>
                                {filteredProducts.length} results for &ldquo;{localQuery}&rdquo;
                            </Text>
                            <FlatList
                                data={filteredProducts}
                                renderItem={renderProduct}
                                numColumns={2}
                                columnWrapperStyle={styles.row}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.productsContainer}
                            />
                        </View>
                    )}
                </View>
            </SafeAreaView >
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    searchContainer: {
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16, marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 22 },
    resultsContainer: { flex: 1 },
    resultsText: {
        fontSize: 16, color: '#333', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e9ecef'
    },
    productsContainer: { padding: 16 },
    row: { justifyContent: 'space-between' },
    productContainer: { flex: 1, marginHorizontal: 4 },
});
