/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import { Colors } from '../constants/Colors';
import { firebaseService } from '../services/firebaseService';
import { formatAddress } from '../services/utilityService';
import { CheckCircle, MapPin, Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { moderateScale, scale } from 'react-native-size-matters';
import { AppText } from './ui';

interface LocationSelectorProps {
    visible: boolean;
    onClose: () => void;
    getLocations: (locations: { id: any, label: string }[]) => void;
}

export default function LocationSelector({ visible, onClose, getLocations }: LocationSelectorProps) {
    const { updateSelectedLocation, selectedLocation, user, userProfile } = useAuth();
    const userId: any = user?.uid || userProfile?.uid;

    const [searchQuery, setSearchQuery] = useState('');
    const [locations, setLocations] = useState<{ id: any, label: string }[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    // 🔹 Fix filtering to use label
    const filteredLocations = locations.filter(location =>
        location.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 🔹 Pass whole object
    const handleSelectLocation = async (location: { id: any, label: string }) => {
        setIsLoading(true);
        await updateSelectedLocation(location.id);
        onClose();
        setIsLoading(false);
    };

    // 🔹 Correct item type
    const renderLocationItem = ({ item }: { item: { id: any, label: string } }) => (
        <TouchableOpacity
            style={styles.locationItem}
            onPress={() => handleSelectLocation(item)}
        >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <MapPin size={20} color="#666" />
                <AppText style={styles.locationText}>{item.label}</AppText>
            </View>
            {selectedLocation === item.id && (<CheckCircle size={20} color={Colors.Primary} />)}
        </TouchableOpacity>
    );

    useEffect(() => {
        const unsubscribe = firebaseService.subscribeToAddresses(userId, (data) => {
            // console.log('Addresses updated:', JSON.stringify(data, null, 2));
            const oLocations = data.map((addr, index) => ({
                id: addr.id ?? index,
                label: formatAddress(addr),
            }));
            // 🔹 Ensure proper object structure
            setLocations(oLocations);
            getLocations(oLocations);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <AppText style={styles.title}>Choose a delivery address</AppText>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={moderateScale(18)} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* <View style={styles.searchContainer}>
                    <Search size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your location"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="words"
                    />
                </View> */}

                {isLoading ? (
                    // 🔹 Loader state
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', maxHeight: 100 }}>
                        <ActivityIndicator size="small" color={Colors.Primary} />
                    </View>
                ) : filteredLocations.length === 0 ? (
                    // 🔹 Empty state
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <AppText style={{ color: '#666' }}>No locations found</AppText>
                    </View>
                ) : (
                    // 🔹 List state
                    <FlatList
                        data={filteredLocations}
                        renderItem={renderLocationItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.list}
                        showsVerticalScrollIndicator={false}
                    />
                )}

            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(5)
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    list: {
        flex: 1,
    },
    locationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    locationText: {
        color: '#333',
        marginHorizontal: 8,
        flex: 1,
        maxWidth: '80%',
    },
});
