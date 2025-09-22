import { Product } from "../types/product";
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


export async function generateOrderId(amount: number): Promise<{ orderId: string, receiptId: string }> {
    try {
        const receiptId = `rcpt_${Date.now()}`;
        const response = await APIService.createOrder({
            amount,
            currency: "INR",
            receipt: receiptId,
        });
        console.log("Razorpay Order ID", response);
        return { orderId: response.id, receiptId };
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

export function generateOrderNumber() {
    const part1 = Math.floor(100 + Math.random() * 900); // 3 digits
    const part2 = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
    const part3 = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
    return `${part1}-${part2}-${part3}`;
};

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

export function formatCurrency(
    amount: number,
    currency: string = 'INR',
    removeDecimal: boolean = false
): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '';
    }

    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: removeDecimal ? 0 : 2,
        maximumFractionDigits: removeDecimal ? 0 : 2,
    });
}

export function getTimestampValue(d: any): number {
    if (!d) return 0;
    if (d.seconds) {
        // Firestore Timestamp
        return d.seconds * 1000;
    }
    if (d instanceof Date) {
        // Already a Date object
        return d.getTime();
    }
    return new Date(d).getTime(); // fallback if it's a string
};

export const sortByDateDesc = <T extends { [key: string]: any }>(
    arr: T[],
    key: keyof T
): T[] => {
    return arr.sort((a, b) => getTimestampValue(b[key]) - getTimestampValue(a[key]));
};


export const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return '#ffa502';
        case 'processing':
            return '#3742fa';
        case 'shipped':
            return '#2f3542';
        case 'confirmed':
            return '#2ed573';
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

export function filterProducts(products: Product[], query: any): Product[] {
    if (!products.length) return [];

    // agar query "all" hai to sab return karo
    if (!query || query === "all") return products;

    return products.filter((product) => {
        let match = true;

        // category filter
        if (query.category && product.category !== query.category) {
            match = false;
        }

        // search keyword filter
        if (query.keyword) {
            const keyword = query.keyword.toLowerCase();
            const values = Object.values(product).join(" ").toLowerCase();
            if (!values.includes(keyword)) {
                match = false;
            }
        }

        // price filter
        if (query.minPrice && product.price < query.minPrice) {
            match = false;
        }
        if (query.maxPrice && product.price > query.maxPrice) {
            match = false;
        }

        return match;
    });
}