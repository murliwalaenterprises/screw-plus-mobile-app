
import { CheckCircle } from "lucide-react-native"; // ✅ Lucide icon
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { StackNames } from "../../constants/StackNames";
import { formatCurrency } from "../../services/utilityService";
import { Colors } from "../../constants/Colors";
import { AppText } from "../../components/ui";

const OrderSuccess = ({ order, navigation }: any) => {
    return (
        <View style={styles.container}>
            {/* ✅ Success Icon */}
            <CheckCircle size={80} color={Colors.light.success} />

            {/* ✅ Success Message */}
            <AppText variant="large" style={styles.successTitle}>Order Placed Successfully</AppText>
            <AppText variant="medium" style={styles.successSubtitle}>
                Your order has been confirmed and will be delivered soon.
            </AppText>

            {/* ✅ Order Details Card */}
            <View style={styles.card}>
                <AppText variant="medium" style={styles.cardTitle}>Order Details</AppText>

                <View style={styles.row}>
                    <AppText style={styles.label}>Order No</AppText>
                    <AppText style={styles.value}>#{order.orderNumber}</AppText>
                </View>

                <View style={styles.row}>
                    <AppText style={styles.label}>Order Date</AppText>
                    <AppText style={styles.value}>{order?.date}</AppText>
                </View>

                <View style={styles.row}>
                    <AppText style={styles.label}>Total Amount</AppText>
                    <AppText style={styles.value}>{formatCurrency(Number(order?.amount))}</AppText>
                </View>

                <View style={styles.row}>
                    <AppText style={styles.label}>Status</AppText>
                    <AppText style={[styles.value, styles.status]}>{order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1)}</AppText>
                </View>
            </View>


            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.addToCartButton} onPress={() => navigation.navigate(StackNames?.Orders)}>
                    <AppText style={styles.addToCartText}>View Orders</AppText>
                </TouchableOpacity>

            </View>
            <View style={styles.durationTimeline}>
                <View style={styles.durationLine} />
                <View style={styles.durationLabel}>
                    <AppText style={styles.durationTimelineText}>OR</AppText>
                </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate(StackNames.MainAppStack)}>
                <AppText variant="medium">Continue Shopping</AppText>
            </TouchableOpacity>

        </View>
    );
};

export default OrderSuccess;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    successTitle: {
        fontWeight: "600",
        marginTop: 16,
        color: "#000",
    },
    successSubtitle: {
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
        marginBottom: 20
    },
    cardTitle: {
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
        color: "#666",
    },
    value: {
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
        paddingBottom: 20,
        backgroundColor: '#fff',
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
        borderColor: "#E0E0E0",
    },
    durationTimelineText: {
        marginLeft: 6,
        fontWeight: "600",
        color: "gray"
    },
});
