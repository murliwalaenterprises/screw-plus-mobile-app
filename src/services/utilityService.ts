import { Address } from "../types/types";
import APIService from "./APIService";


type AddressFields = Pick<Address, "address" | "city" | "state" | "pincode">;

export const formatAddress = (addr: AddressFields) => {
    return `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
};

export function getDiscountPercentage(mrp: number, salePrice: number): number {
    if (!mrp || mrp <= 0) return 0; // avoid divide by zero
    const discount = ((mrp - salePrice) / mrp) * 100;
    return discount ? Math.round(discount) : 0; // round to nearest %
}

// export const getProductVariant = (product: any, size?: string, color?: string): Product => {
//     // Find exact match
//     const variant = product.variants?.find(
//         (v: any) => v.size === size && v.color === color
//     );

//     if (variant) {
//         product.price = variant.price;
//         product.originalPrice = variant.originalPrice;
//     }

//     // If no exact match, find the lowest price variant
//     if (product.variants && product.variants.length > 0) {
//         const lowestVariant = product.variants.reduce((min: any, v: any) =>
//             v.price < min.price ? v : min
//         );
//         product.price = lowestVariant.price;
//         product.originalPrice = lowestVariant.originalPrice;
//     }

//     // Fallback to product price
//     return product;
// };




export const getProductVariant = (product: any, size?: string, color?: string) => {
    if (size && color) {
        // Find exact match
        const variant = product.variants?.find(
            (v: any) => v.size === size && v.color === color
        );
        return variant;
    } else if (product.variants && product.variants.length > 0) {
        const lowestVariant = product.variants.reduce((min: any, v: any) =>
            v.price < min.price ? v : min
        );
        return lowestVariant;
    } else {
        return {
            price: product.price,
            originalPrice: product.price,
        }
    }
};


export async function generateOrderId(amount: number): Promise<{orderId: string, receiptId: string}> {
  try {
    const receiptId = `rcpt_${Date.now()}`;
    const response = await APIService.createOrder({
      amount,
      currency: "INR",
      receipt: receiptId,
    });
    console.log("Razorpay Order ID", response);
    return {orderId: response.id, receiptId}; 
  } catch (error) {
    console.error("Error generating Razorpay Order ID", error);
    throw error;
  }
}

export function formatTimestampDate(timestamp: any): string {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function getTimestampToDate(timestamp: any): string {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date;
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export function getEstimatedDeliveryDate(placedOn: string | Date, deliveryType: "standard" | "express" | "same-day" = "standard"): Date {
    const placedDate = new Date(placedOn);

    switch (deliveryType) {
        case "express":
            placedDate.setDate(placedDate.getDate() + 2); // 2 din add
            break;
        case "same-day":
            // Agar order 2 baje se pehle hai toh same day, warna next day
            const cutoffHour = 14;
            if (new Date(placedOn).getHours() >= cutoffHour) {
                placedDate.setDate(placedDate.getDate() + 1);
            }
            break;
        default: // standard
            placedDate.setDate(placedDate.getDate() + 5); // 5 din add
    }

    // .toLocaleDateString("en-IN", {
    //     day: "2-digit",
    //     month: "short",
    //     year: "numeric",
    // });

    return placedDate
}

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return '#ffa502';
        case 'processing':
            return '#3742fa';
        case 'shipped':
            return '#2f3542';
        case 'delivered':
            return '#2ed573';
        case 'cancelled':
            return '#ff4757';
        default:
            return '#ffa502';
    }
};

export const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
    // { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'online', name: 'UPI Payment', icon: '📱' },
    // { id: 'wallet', name: 'Digital Wallet', icon: '💰' }
];