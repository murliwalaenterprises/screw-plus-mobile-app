import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import AuthStack from './AuthStack';
import { StackNames } from '../constants/stackNames';
import OnboardingScreen from '../screens/onboarding';
import ProductDetailScreen from '../screens/product/ProductDetails';
import CartScreen from '../screens/product/cart';
import CheckoutScreen from '../screens/product/checkout';
import OrdersScreen from '../screens/product/orders';
import EditProfileScreen from '../screens/edit-profile';
import AdminScreen from '../screens/admin';
import WishlistScreen from '../screens/wishlist';
import AddressesScreen from '../screens/addresses';
import NotificationsScreen from '../screens/notifications';
import SettingsScreen from '../screens/settings';
import PaymentMethodsScreen from '../screens/payment-methods';
import OrderDetailsScreen from '../screens/product/OrderDetails';
import PdfPreview from '../screens/product/Invoice';
import AdminOrderDetailsScreen from '../screens/product/AdminOrderDetails';

const Stack = createNativeStackNavigator();

const RootStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name={StackNames.Onboarding} component={OnboardingScreen} />
            <Stack.Screen name={StackNames.AuthStack} component={AuthStack} />
            <Stack.Screen name={StackNames.MainAppStack} component={BottomTabs} />
            <Stack.Screen name={StackNames.ProductDetails} component={ProductDetailScreen}/>
            <Stack.Screen name={StackNames.Cart} component={CartScreen} options={{headerShown: true, headerBackTitle: "Back", title:'Cart'}}/>
            <Stack.Screen name={StackNames.Checkout} component={CheckoutScreen}  options={{headerShown: true, headerBackTitle: "Back", title:'Checkout'}}/>
            <Stack.Screen name={StackNames.Orders} component={OrdersScreen}  options={{headerShown: true, headerBackTitle: "Back", title:'Orders'}}/>
            <Stack.Screen name={StackNames.EditProfile} component={EditProfileScreen} options={{headerShown: true, headerBackTitle: "Back", title:'Edit Profile'}}/>
            <Stack.Screen name={StackNames.AdminScreen} component={AdminScreen} options={{headerShown: true, headerBackTitle: "Back", title: 'Admin'}}/>
            <Stack.Screen name={StackNames.WishListScreen} component={WishlistScreen} options={{headerShown: true, headerBackTitle: "Back", title:'Wishlist'}}/>
            <Stack.Screen name={StackNames.AddressesScreen} component={AddressesScreen}  options={{headerShown: true, headerBackTitle: "Back", title: "Addresses"}}/>
            <Stack.Screen name={StackNames.NotificationsScreen} component={NotificationsScreen}  options={{headerShown: true, headerBackTitle: "Back", title:'Notifications'}}/>
            {/* <Stack.Screen name={StackNames.SettingsScreen} component={SettingsScreen}  options={{headerShown: true, headerBackTitle: "Back", title:'Settings'}}/> */}
            <Stack.Screen name={StackNames.PaymentMethodsScreen} component={PaymentMethodsScreen}  options={{headerShown: true, headerBackTitle: "Back", title: "Payment Methods"}}/>
            <Stack.Screen name={StackNames.OrderDetailsScreen} component={OrderDetailsScreen} options={{headerShown: true, headerBackTitle: "Back", title:'Order Details'}}/>
            <Stack.Screen name={StackNames.PdfPreview} component={PdfPreview} options={{headerShown: true, headerBackTitle: "Back", title:'Invoice'}}/>
            <Stack.Screen name={StackNames.AdminOrderDetailsScreen} component={AdminOrderDetailsScreen} options={{headerShown: true, headerBackTitle: "Back", title:'Customer Order Details'}}/>

        </Stack.Navigator>
    );
};

export default RootStack;
