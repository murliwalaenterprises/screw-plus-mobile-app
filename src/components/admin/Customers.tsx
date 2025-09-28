/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useState } from "react";
import {
    Alert,
    Animated,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
    findNodeHandle,
} from "react-native";
import { Edit3, Plus, ShareIcon, Trash2, Users } from "lucide-react-native";
import { QuickMenu } from "../ui";

const initialCustomers: Customer[] = [
    { id: "1", name: "Rahul Sharma", email: "rahul@example.com", mobile: "9876543210" },
    { id: "2", name: "Priya Verma", email: "priya@example.com", mobile: "8765432109" },
    { id: "3", name: "Amit Singh", email: "amit@example.com", mobile: "7654321098" },
];

// ----------------- Child Card Component -----------------
type Customer = {
    id: string;
    name: string;
    email: string;
    mobile: string;
};

type CustomerCardProps = {
    item: Customer;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};
const CustomerCard: React.FC<CustomerCardProps> = ({ item, onEdit, onDelete }) => {
    return (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>📧 {item.email}</Text>
                <Text style={styles.detail}>📱 {item.mobile}</Text>
            </View>

            <QuickMenu options={[
                {
                    label: "Edit",
                    icon: <Edit3 size={12} color="#222" />,
                    onPress: () => console.log("Edit clicked"),
                },
                {
                    label: "Delete",
                    icon: <Trash2 size={12} color="#EF4444" />,
                    onPress: () => console.log("Delete clicked"),
                    textColor: "#EF4444",
                },
                {
                    label: "Share",
                    icon: <ShareIcon size={12} color="#2563EB" />,
                    onPress: () => console.log("Share clicked"),
                    textColor: "#2563EB",
                },
            ]} />
        </View>
    );
};


// ----------------- Main Customers Screen -----------------
export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [refreshing, setRefreshing] = useState(false);

    const handleAdd = () => {
        Alert.alert("Add Customer", "Open customer add form here");
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Users size={24} color="#3B82F6" />
                    <Text style={styles.headerTitle}>Customers ({customers.length})</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                    <Plus size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add Customer</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={customers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CustomerCard
                        item={item}
                        onEdit={(id) => console.log("Edit", id)}
                        onDelete={(id) => console.log("Delete", id)}
                    />
                )}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </View>
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
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3B82F6",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonText: { color: "#FFFFFF", fontWeight: "500", marginLeft: 4 },
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
