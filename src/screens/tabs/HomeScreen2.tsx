 /* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    FlatList,
    StatusBar,
    ImageBackground,
    RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { scale } from "react-native-size-matters";
import { darkWeatherColors, defaultHeaderTransparent } from "../../constants/Constant";
import { CircleUserRound, CloudRainWind, Mic, Search, UserRoundPlus } from "lucide-react-native";

// 🔹 Your Category Data
const categories = [
    {
        id: "1",
        label: "Milk, Curd & Paneer",
        image: "https://png.pngtree.com/png-clipart/20240617/original/pngtree-assortment-of-dairy-products-sour-fresh-meal-photo-png-image_15346181.png",
    },
    {
        id: "2",
        label: "Pharma & Wellness",
        image: "https://img.freepik.com/premium-vector/health-wellness-logo-design-vector-art-illustration_761413-30449.jpg",
    },
    {
        id: "3",
        label: "Vegetables & Fruits",
        image: "https://www.lalpathlabs.com/blog/wp-content/uploads/2019/01/Fruits-and-Vegetables.jpg",
    },
    {
        id: "4",
        label: "Munchies",
        image: "https://i5.walmartimages.ca/images/Enlarge/481/457/6000208481457.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
    },
    {
        id: "5",
        label: "Home & Office",
        image: "https://png.pngtree.com/png-vector/20240305/ourmid/pngtree-a-home-office-setup-png-image_11895310.png",
    },
    {
        id: "6",
        label: "Baby Care",
        image: "https://png.pngtree.com/png-clipart/20221014/ourmid/pngtree-baby-care-png-image_6149633.png",
    },
    {
        id: "7",
        label: "Ata, Rice & Dal",
        image: "https://www.jiomart.com/images/product/original/492338750/atta-dal-rice-combo-chakki-atta-5-kg-toor-dal-2-kg-surti-kolam-rice-2-kg-product-images-o492338750-p590318703-0-202407051514.jpg?im=Resize=(1000,1000)",
    },
    {
        id: "8",
        label: "Cleaning Essentials",
        image: "https://static.vecteezy.com/system/resources/thumbnails/009/677/869/small_2x/bucket-with-cleaning-supplies-collection-isolated-on-white-background-housework-concept-design-elements-illustration-vector.jpg",
    },
];

const HomeScreen = () => {
    const [refreshing, setRefreshing] = React.useState(false);
    const isRaining = true;

    const themeBackground = 'https://img.freepik.com/free-vector/happy-diwali-wishes-banner-with-diya-text-space_1017-46555.jpg?semt=ais_incoming&w=740&q=80';

    // 🔹 Weather Header Animation (Opacity)
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(50, [0, 120], [1, 0]);
        return { opacity };
    });

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await Promise.all([
            ]);
        } catch (error) {
            console.log("Refresh error:", error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
            {/* 🔹 Weather Animated Header */}
            <StatusBar barStyle={'default'} translucent={true} backgroundColor={'transparent'} />
            <View style={styles.container}>
                <ImageBackground
                    source={{ uri: isRaining ? 'https://i.pinimg.com/736x/05/9d/84/059d84c4af61d13a05758da24ff94d9b.jpg' : themeBackground }}
                    style={{
                        flex: 1,
                        width: '100%',
                        height: 200,
                        marginBottom: 180
                    }}
                    resizeMode="cover"
                >
                    <Animated.View style={[styles.headerBg]}>
                        <LinearGradient
                            colors={isRaining ? darkWeatherColors : defaultHeaderTransparent} // dark navy -> grey-blue -> white
                            start={{ x: 0.5, y: 0.5 }}
                            end={{ x: 0.5, y: 1 }}
                            style={styles.gradient}
                        >
                            {/* Cloud PNG */}
                            {
                                isRaining && (
                                    <>
                                        <Image
                                            source={require('../../assets/images/cloud.png')}
                                            // source={{ uri: 'https://png.pngtree.com/background/20210711/original/pngtree-vector-illustration-on-the-theme-of-the-traditional-celebration-of-happy-picture-image_1152388.jpg' }}
                                            style={styles.cloud}
                                        />

                                        {/* Rain Animation */}
                                        <LottieView
                                            autoPlay
                                            loop
                                            style={styles.lottie}
                                            source={require('../../assets/animations/raining.json')}
                                        />
                                    </>
                                )
                            }

                            <View style={{ paddingTop: 160, paddingHorizontal: 20 }}>
                                {/* Top Info */}
                                <View style={styles.header}>
                                    <View>
                                        <Text style={styles.deliveryText}>Delivery in</Text>
                                        <View style={styles.row}>
                                            <Text style={styles.timeText}>15 minutes </Text>
                                            {/* <Icon name="rainy-outline" size={16} color="#fff" /> */}
                                            <CloudRainWind color={'#fff'} size={16}/>
                                        </View>
                                        <Text style={styles.address}>176/A, Sector-1, Sultanpur</Text>
                                    </View>
                                    <TouchableOpacity>
                                        {/* <Icon name="person-circle-outline" size={38} color="#fff" /> */}
                                        <CircleUserRound color={'white'} size={38}/>
                                    </TouchableOpacity>
                                </View>

                                {/* Search */}
                                <View style={styles.searchBox}>
                                    {/* <Icon name="search-outline" size={20} color="#555" /> */}
                                    <Search color={'#555'} size={20}/>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Search for ata, dal, coke"
                                        placeholderTextColor="#888"
                                    />
                                    <TouchableOpacity>
                                        {/* <Icon name="mic-outline" size={20} color="#555" /> */}
                                        <Mic color={'#555'} size={20}/>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* 🔹 Fade Overlay Bottom */}
                            <LinearGradient
                                colors={["transparent", "#ffffff"]}
                                style={styles.fadeBottom}
                            />

                        </LinearGradient>
                    </Animated.View>
                </ImageBackground>

                {/* 🔹 Scroll Content */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#1a2a6c", "#4caf50", "#2196f3"]} // Android spinner colors
                            tintColor="#1a2a6c" // iOS spinner color
                            titleColor="#1a2a6c"
                            progressBackgroundColor="#fff"
                        />
                    }
                >
                    {/* Banner */}
                    <Animatable.View animation="fadeInUp" duration={800} style={styles.bannerBox}>
                        <Image
                            source={{
                                uri: "https://images.meesho.com/images/marketing/1757490578069.webp",
                            }}
                            style={styles.banner}
                            resizeMode="cover"
                        />
                    </Animatable.View>

                    {/* Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Shop by categories</Text>
                        <FlatList
                            data={categories}
                            numColumns={4}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                                <Animatable.View
                                    animation="zoomIn"
                                    delay={index * 120}
                                    style={styles.catBox}
                                    key={index + 1}
                                >
                                    <TouchableOpacity style={styles.catCard}>
                                        <Image source={{ uri: item.image }} style={styles.catImage} />
                                        <Text style={styles.catText}>{item.label}</Text>
                                    </TouchableOpacity>
                                </Animatable.View>
                            )}
                        />
                    </View>

                    <View style={{ backgroundColor: '#f8f8f8', width: '100%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 }}>
                        <Text style={{ fontSize: scale(50), fontWeight: 'bold', opacity: 0.2 }}>Screw Plus</Text>
                        <Text style={{ opacity: 0.2, marginTop: 10, }}>Developed By ❤️ Murliwala Enterprises</Text>
                    </View>
                </ScrollView>

            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerBg: {
        overflow: "hidden",
        // paddingBottom: 100,
    },
    gradient: {
        height: 300,
        marginTop: -100,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    deliveryText: { fontSize: 12, color: "#eee" },
    row: { flexDirection: "row", alignItems: "center" },
    timeText: { fontSize: 16, fontWeight: "600", color: "#fff" },
    address: { fontSize: 12, color: "#ddd" },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    input: { flex: 1, fontSize: 14, paddingHorizontal: 8, color: "#000" },
    bannerBox: { borderRadius: 14, overflow: "hidden", marginHorizontal: 15, marginTop: 27, marginBottom: 10 },
    banner: { width: "100%", height: 140, borderRadius: 14 },
    section: { marginBottom: 20, paddingHorizontal: 12 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: '#fff' },
    catBox: { flex: 1, margin: 5, alignItems: "center" },
    catCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
        width: 80,
        height: 90,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    catImage: { width: 40, height: 40, marginBottom: 5, resizeMode: "contain" },
    catText: { fontSize: 11, textAlign: "center", color: "#333" },
    cloud: {
        position: "absolute",
        top: -20,
        left: 0,
        right: 0,
        resizeMode: "contain",
        opacity: 0.8,
    },
    lottie: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    fadeBottom: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
});
