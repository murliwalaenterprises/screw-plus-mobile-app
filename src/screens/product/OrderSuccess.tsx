
import { CheckCircle } from "lucide-react-native"; // ✅ Lucide icon
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StackNames } from "../../constants/stackNames";
import { formatCurrency } from "../../services/utilityService";

const OrderSuccess = ({ order, navigation }: any) => {
    return (
        <View style={styles.container}>
            {/* ✅ Success Icon */}
            <CheckCircle size={80} color="green" />

            {/* ✅ Success Message */}
            <Text style={styles.successTitle}>Order Placed Successfully</Text>
            <Text style={styles.successSubtitle}>
                Your order has been confirmed and will be delivered soon.
            </Text>

            {/* ✅ Order Details Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Order Details</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Order No</Text>
                    <Text style={styles.value}>#{order?.id}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Order Date</Text>
                    <Text style={styles.value}>{order?.date}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Total Amount</Text>
                    <Text style={styles.value}>{formatCurrency(Number(order?.amount))}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={[styles.value, styles.status]}>{order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1)}</Text>
                </View>
            </View>


            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.addToCartButton} onPress={() => navigation.navigate(StackNames?.Orders)}>
                    <Text style={styles.addToCartText}>View Orders</Text>
                </TouchableOpacity>

            </View>
            <View style={styles.durationTimeline}>
                <View style={styles.durationLine} />
                <View style={styles.durationLabel}>
                    <Text style={styles.durationTimelineText}>OR</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate(StackNames.MainAppStack)}>
                <Text>Continue Shopping</Text>
            </TouchableOpacity>

        </View>
    );
};

export default OrderSuccess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    successTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 16,
        color: "#000",
    },
    successSubtitle: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 4,
        marginBottom: 20,
        color: "#555",
    },
    card: {
        width: "100%",
        borderRadius: 12,
        backgroundColor: "#f9f9f9",
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        color: "#000",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 4,
    },
    label: {
        fontSize: 14,
        color: "#666",
    },
    value: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
    },
    status: {
        color: "orange",
        fontWeight: "600",
    },

    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 10
    },
    addToCartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    addToCartText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        marginLeft: 8,
    },
    buyNowButton: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#333',
        gap: 8
    },
    buyNowText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    durationTimeline: {
        alignItems: "center",
        marginBottom: 20,
    },
    durationLine: {
        width: "100%",
        height: 1,
        backgroundColor: "#E0E0E0",
        position: "absolute",
        top: "50%",
    },
    durationLabel: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#007AFF",
    },
    durationTimelineText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "600",
        color: "#007AFF"
    },
});
