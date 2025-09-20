/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { ChevronRight } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
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
import { getOnboardingSession } from '../services/session';
import { firebaseService } from '../services/firebaseService';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const [checkOnboard, setCheckOnboard] = useState(false);
    const [onBoardSlides, setOnBoardSlides] = useState<any[]>([]);
    const fadeAnim = useRef(new Animated.Value(1)).current;


    useEffect(() => {
        firebaseService.subscribeToAppConfig((config: any) => {
            console.log("App Config:", config);
            if (config) {
                const onBoardSliders = config?.onboardScreens || [];
                setOnBoardSlides(onBoardSliders);
            }
        })
    }, [])

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
        if (currentIndex < onBoardSlides.length - 1) {
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
                {onBoardSlides.map((image: any, index: number) => (
                    <View key={index} style={[styles.slide, { padding: 0 }]}>
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={{
                                width: '100%',
                                height: '100%',
                            }}
                            resizeMode="contain"
                        />
                    </View>
                ))}
            </ScrollView>

            {/* {renderPagination()} */}

            <View style={styles.footer}>
                <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                    <LinearGradient
                        colors={[Colors.light.homeScreenHeaderBackground.start, Colors.light.homeScreenHeaderBackground.end]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.nextButtonGradient}>
                            <Text style={styles.nextButtonText}>
                                {currentIndex === onBoardSlides.length - 1 ? 'Get Started' : 'Next'}
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