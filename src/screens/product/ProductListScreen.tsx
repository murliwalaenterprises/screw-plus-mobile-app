/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useState } from "react";
import {
    View,
    FlatList,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, scale } from "react-native-size-matters";

import ProductCard from "../../components/ProductCard";
import ScreenHeader from "../../components/ScreenHeader";
import { Product } from "../../types/product";
import { Colors } from "../../constants/Colors";
import { StackNames } from "../../constants/StackNames";
import { useFirebaseData } from "../../store/useFirebaseData";
import { Search, ShoppingCart } from "lucide-react-native";
import { useStore } from "../../store/useStore";
import { IconConfig } from "../../constants/Constant";
import { filterProducts } from "../../services/utilityService";
import { AppText } from "../../components/ui";

const screenWidth = Dimensions.get("window").width;

const ProductListScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {

    const { query } = route.params || {};

    const { getCartItemsCount } = useStore();
    const { products } = useFirebaseData();
    const cartItemsCount = getCartItemsCount();

    const [filteredProducts, setFilteredProducts] = useState(products || []);

    const renderProduct = useCallback(
        ({ item }: { item: Product }) => {
            return (
                <View style={styles.productWrapper}>
                    <ProductCard
                        navigation={navigation}
                        product={item}
                        width={(screenWidth - 20) / 2}
                        showCartButton
                    />
                </View>
            );
        },
        [navigation]
    );

    React.useEffect(() => {
        if (products.length) {
            const filteredList = filterProducts(products, query);
            setFilteredProducts(filteredList);
        }
    }, [query, products]);

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScreenHeader title={query.title ? query.title : StackNames.ProductListScreen} navigation={navigation}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: scale(20) }}>
                    <TouchableOpacity onPress={() => navigation.navigate(StackNames.SearchResults)}>
                        <Search size={IconConfig.size} color={Colors.StatusBarTextColor} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigation.navigate(StackNames.Cart)}>
                        <ShoppingCart
                            size={IconConfig.size}
                            color={Colors.StatusBarTextColor}
                        />
                        {cartItemsCount > 0 && (
                            <View style={styles.cartBadge}>
                                <AppText style={styles.cartBadgeText}>{cartItemsCount}</AppText>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScreenHeader>
            <View style={styles.listContainer}>
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderProduct}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={{ paddingBottom: moderateScale(100), paddingTop: moderateScale(28) }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={() => (
                        <View style={styles.noProducts}>
                            <AppText style={styles.noProductsText}>No products found</AppText>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

export default ProductListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.StatusBarBg,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: moderateScale(8),
    },
    row: {
        justifyContent: "space-between",
    },
    productWrapper: {
        flex: 1,
    },
    noProducts: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    noProductsText: {
        fontSize: moderateScale(16),
        color: "gray",
    },
    headerButton: {
        padding: scale(8),
        marginLeft: scale(8),
    },
    cartButton: {
        position: 'relative',
        right: -3,
        top: -1
    },
    cartBadge: {
        position: 'absolute',
        top: scale(-10),
        right: scale(-10),
        backgroundColor: '#ff4757',
        borderRadius: scale(10),
        minWidth: scale(20),
        height: scale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadgeText: {
        color: '#fff',
        fontWeight: '600',
    },
});
