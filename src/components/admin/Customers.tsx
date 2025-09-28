/* eslint-disable react-native/no-inline-styles */
import React, { useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Edit3, Users } from "lucide-react-native";
import { BottomSheetModal, HeaderRow, Input, QuickMenu } from "../ui";
import { firebaseService } from "../../services/firebaseService";
import { verticalScale } from "react-native-size-matters";

// ----------------- Child Card Component -----------------
type Customer = {
    id: string;
    name: string;
    email: string;
    mobile: string;
};

type CustomerCardProps = {
    item: Customer;
    onEdit: (item: any) => void;
};
const CustomerCard: React.FC<CustomerCardProps> = ({ item, onEdit }) => {
    return (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || 'Unknown person'}</Text>
                <Text style={styles.detail}>📧 {item.email || 'NA'}</Text>
                <Text style={styles.detail}>📱 {item.mobile || 'NA'}</Text>
            </View>

            <QuickMenu options={[
                {
                    label: "Edit",
                    icon: <Edit3 size={12} color="#222" />,
                    onPress: () => onEdit(item),
                },
            ]} />
        </View>
    );
};


// ----------------- Main Customers Screen -----------------
export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [showBottomSheet, setShowBottomSheetSheet] = useState(false);

    const [selectedItem, setSelectedItem] = useState<{
        id: string,
        name: string,
        email: string,
        mobile: string,
        gstNumber: string,
    }>({
        id: '',
        name: '',
        email: '',
        mobile: '',
        gstNumber: '',
    });

    const onRefresh = async () => {
        setRefreshing(true);
        fetchCustomers();
        setTimeout(() => setRefreshing(false), 1000);
    };

    React.useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            firebaseService.subscribeToAllCustomers((customersRes) => {
                const list = customersRes ? customersRes.filter(r => !r.isAdmin).map(oCustomer => {
                    return { id: oCustomer.uid, name: oCustomer.displayName, email: oCustomer.email, mobile: oCustomer.phoneNumber }
                }) : [];
                setCustomers(list);
            })
        } catch (e) {
            console.log(e);
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Users size={24} color="#3B82F6" />
                    <Text style={styles.headerTitle}>Customers ({customers.length})</Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (<CustomerCard item={item} onEdit={(data) => {
                    console.log('selected item', data);
                    setSelectedItem(data);
                    setShowBottomSheetSheet(true);
                }} />)}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />

            <BottomSheetModal visible={showBottomSheet} onClose={() => setShowBottomSheetSheet(false)}>
                {/* Header */}
                <HeaderRow
                    title="Edit customer's details"
                    buttonText="Save"
                    onPress={() => setShowBottomSheetSheet(false)}
                    containerStyle={{ marginBottom: verticalScale(20) }}
                />

                {/* Content */}
                <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20 }}>
                    <Input
                        label="Name"
                        value={selectedItem.name}
                        onChangeText={(text: any) => console.log('text', text)}
                    />
                    <Input
                        label="Email"
                        value={selectedItem.email}
                        onChangeText={(text: any) => console.log('text', text)}
                    />
                    <Input
                        label="Phone"
                        value={selectedItem.mobile}
                        maxLength={10}
                        onChangeText={(text: any) => console.log('text', text)}
                    />
                    <Input
                        label="GST Number"
                        value={selectedItem.gstNumber}
                        onChangeText={(text: any) => console.log('text', text)}
                    />
                </View>
            </BottomSheetModal>

        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9FAFB" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerLeft: { flexDirection: "row", alignItems: "center" },
    headerTitle: { fontSize: 18, fontWeight: "600", color: "#1F2937", marginLeft: 8 },
    list: { padding: 20 },
    card: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    name: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 4 },
    detail: { fontSize: 14, color: "#6B7280", marginBottom: 2 },
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.1)" },
    menuContainer: {
        position: "absolute",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        minWidth: 140,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    menuText: { marginLeft: 8, fontSize: 15, color: "#1F2937" },
});
