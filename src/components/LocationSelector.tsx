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
            <MapPin size={20} color="#666" />
            <Text style={styles.locationText}>{item.label}</Text>
            {selectedLocation === item.id && (<CheckCircle size={20} color={Colors.light.primaryButtonBackground.end} />)}
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
                    <Text style={styles.title}>Select Location</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for your city"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="words"
                    />
                </View>

                {isLoading ? (
                    // 🔹 Loader state
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', maxHeight: 100 }}>
                        <ActivityIndicator size="large" color={Colors.light.primaryButtonBackground.end} />
                    </View>
                ) : filteredLocations.length === 0 ? (
                    // 🔹 Empty state
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#666' }}>No locations found</Text>
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
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
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
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    locationText: {
        fontSize: 16,
        color: '#333',
        marginHorizontal: 8,
        flex: 1,
        width: '84%',
    },
});
