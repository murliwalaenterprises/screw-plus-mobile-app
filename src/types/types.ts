
interface Address {
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    isDefault: boolean;
}

interface OrderItem {
    productId: string;
    name: string;
    description: string;
    brand: string;
    category: string;
    image: string;
    size?: string;
    color?: string;
    price: number;
    quantity: number;
    total: number;
}

interface Order {
    id?: string;
    userId?: string;
    orderId: string;
    items: OrderItem[];
    invoiceNo: string | null;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    deliveryAddress: string;
    paymentMethod: string;
    isPaid: false,
    subTotal: number;
    deliveryFee: number;
    taxPercentage: number;
    taxAmount: number;
    platformFee: number;
    discount: number;
    finalTotal: number;
    notes?: string;
    estimatedDelivery?: Date;
    orderDate: Date;
}


export {
    Address, Order, OrderItem
};

