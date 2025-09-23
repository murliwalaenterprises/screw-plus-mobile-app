import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import BottomTabs from './BottomTabs';
import AuthStack from './AuthStack';
import { StackNames } from '../constants/StackNames';
import OnboardingScreen from '../screens/OnBoarding';
import ProductDetailScreen from '../screens/product/ProductDetails';
import CartScreen from '../screens/product/Cart';
import About from '../screens/About';
import AddressesScreen from '../screens/Addresses';
import AdminScreen from '../screens/Admin';
import EditProfileScreen from '../screens/EditProfile';
import NotificationsScreen from '../screens/Notifications';
import PaymentMethodsScreen from '../screens/PaymentMethods';
import AdminOrderDetailsScreen from '../screens/product/AdminOrderDetails';
import CheckoutScreen from '../screens/product/Checkout';
import PdfPreview from '../screens/product/Invoice';
import OrderDetailsScreen from '../screens/product/OrderDetails';
import OrdersScreen from '../screens/product/Orders';
import ProductListScreen from '../screens/product/ProductListScreen';
import WishlistScreen from '../screens/Wishlist';

const Stack = createNativeStackNavigator();

const RootStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={StackNames.Onboarding} component={OnboardingScreen} />
            <Stack.Screen name={StackNames.AuthStack} component={AuthStack} />
            <Stack.Screen name={StackNames.MainAppStack} component={BottomTabs} />
            <Stack.Screen name={StackNames.ProductDetails} component={ProductDetailScreen} />
            <Stack.Screen name={StackNames.Cart} component={CartScreen} />
            <Stack.Screen name={StackNames.Checkout} component={CheckoutScreen} />
            <Stack.Screen name={StackNames.Orders} component={OrdersScreen} />
            <Stack.Screen name={StackNames.EditProfile} component={EditProfileScreen} />
            <Stack.Screen name={StackNames.AdminScreen} component={AdminScreen} />
            <Stack.Screen name={StackNames.WishListScreen} component={WishlistScreen} />
            <Stack.Screen name={StackNames.AddressesScreen} component={AddressesScreen} />
            <Stack.Screen name={StackNames.NotificationsScreen} component={NotificationsScreen} />
            <Stack.Screen name={StackNames.PaymentMethodsScreen} component={PaymentMethodsScreen} />
            <Stack.Screen name={StackNames.OrderDetailsScreen} component={OrderDetailsScreen} />
            <Stack.Screen name={StackNames.PdfPreview} component={PdfPreview} />
            <Stack.Screen name={StackNames.AdminOrderDetailsScreen} component={AdminOrderDetailsScreen} />
            <Stack.Screen name={StackNames.ProductListScreen} component={ProductListScreen} />
            <Stack.Screen name={StackNames.SearchResults} component={Search} />
            <Stack.Screen name={StackNames.AboutUs} component={About} />
        </Stack.Navigator>
    );
};

export default RootStack;
