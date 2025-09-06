

import { ChevronRight, Shield, ShoppingBag, Truck } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { StackNames } from '../constants/stackNames';
import { getOnboardingSession, getUserSession } from '../services/session';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    gradient: [string, string];
    image?: { uri: string }
}



export default function OnboardingScreen({ navigation }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
     const [checkOnboard, setCheckOnboard] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const slides: any = [
        {
            id: 1,
            title: 'Welcome to',
            subtitle: 'Screw Plus',
            description: 'Discover the latest fashion trends and shop your favorite styles with ease.',
            icon: <ShoppingBag size={80} color="#fff" />,
            gradient: ['#FF944D', '#CC5200'],
            image: { uri: 'https://i.pinimg.com/736x/02/33/ce/0233ced33033e9be62126046c9a73017.jpg' }
        },
        {
            id: 2,
            title: 'Fast',
            subtitle: 'Delivery',
            description: 'Get your orders delivered quickly and safely to your doorstep.',
            icon: <Truck size={80} color="#fff" />,
            gradient: ['#f093fb', '#f5576c'],
            image: { uri: 'https://i.pinimg.com/736x/44/3b/4c/443b4c670baff78987bc86b360c728f0.jpg' }
        },
        {
            id: 3,
            title: 'Secure',
            subtitle: 'Shopping',
            description: 'Shop with confidence knowing your data and payments are secure.',
            icon: <Shield size={80} color="#fff" />,
            gradient: ['#4facfe', '#00f2fe'],
            image: { uri: 'https://png.pngtree.com/background/20210711/original/pngtree-e-commerce-training-enrollment-poster-background-material-picture-image_1116075.jpg' }
        },
    ];

       React.useEffect(() => {
        getOnboardingSession().then((hasCompletedOnboarding: boolean) => {
          if (hasCompletedOnboarding) {
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: StackNames.AuthStack,
                },
              ],
            });
            return;
          }
          setCheckOnboard(true);
        });
      }, []);
    
      if (!checkOnboard) {
        return;
      }

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);

            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();

            scrollViewRef.current?.scrollTo({
                x: nextIndex * width,
                animated: true,
            });
        } else {
            navigation.navigate(StackNames.AuthStack);
        }
    };

    const handleSkip = () => {
        navigation.navigate(StackNames.MainAppStack);
    };

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset;
        const viewSize = event.nativeEvent.layoutMeasurement;
        const pageNum = Math.floor(contentOffset.x / viewSize.width);
        setCurrentIndex(pageNum);
    };

    const renderSlide = (slide: OnboardingSlide, index: number) => (
        <View key={slide.id} style={styles.slide}>
            <LinearGradient
                colors={slide.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.slideGradient}>
                    <Animated.View style={[styles.slideContent, { opacity: fadeAnim }]}>
                        {/* <View style={styles.iconContainer}>
                            {slide.icon}
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{slide.title}</Text>
                            <Text style={styles.subtitle}>{slide.subtitle}</Text>
                            <Text style={styles.description}>{slide.description}</Text>
                        </View> */}
                        <View>
                            <Image
                                key={index}
                                source={slides[index].image}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 4,
                                    marginHorizontal: 4,
                                    opacity: index === currentIndex ? 1 : 0.5,
                                }}
                                resizeMode="cover"
                            />
                        </View>
                    </Animated.View>
                </View>
            </LinearGradient>
        </View>
    );

    const renderPagination = () => (
        <View style={styles.pagination}>
            {slides.map((_: any, index: number) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        index === currentIndex && styles.paginationDotActive,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {slides.map((slide: any, index: number) => (
                    <View key={index} style={[styles.slide, {padding: 20}]}>
                        <Image
                            key={index}
                            source={slide.image}
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: 12,
                                marginHorizontal: 4,
                                opacity: index === currentIndex ? 1 : 0.5,
                            }}
                            resizeMode="cover"
                        />
                    </View>
                ))}
                {/* <Text>Hello</Text> */}
            </ScrollView>

            {/* {renderPagination()} */}

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                    <LinearGradient
                        colors={slides[currentIndex].gradient}

                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.nextButtonGradient}>
                            <Text style={styles.nextButtonText}>
                                {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                            </Text>
                            <ChevronRight size={20} color="#fff" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width,
        flex: 1,
    },
    slideGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    slideContent: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    iconContainer: {
        marginBottom: 60,
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '300',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    description: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 26,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ddd',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#667eea',
        width: 24,
    },
    footer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    nextButton: {
        borderRadius: 25,
        overflow: 'hidden',
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
});