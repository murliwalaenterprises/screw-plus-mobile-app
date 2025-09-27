/* eslint-disable react-native/no-inline-styles */

import { BarChart3, Grid3X3, Image, Package, Settings, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductsTab from '../components/admin/ProductsTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import BannersTab from '../components/admin/BannersTab';
import StatsTab from '../components/admin/StatsTab';
import OrderTab from '../components/admin/OrderTab';
import ScreenHeader from '../components/ScreenHeader';
import { StackNames } from '../constants/StackNames';
import { Colors } from '../constants/Colors';
import AppConfigSettings from '../components/admin/AppConfigSettings';
import Customers from '../components/admin/Customers';

type TabType = 'products' | 'categories' | 'banners' | 'stats' | 'orders' | 'customers' | 'settings';

interface Tab {
  id: TabType;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
}

const tabs: Tab[] = [
  { id: 'stats', title: 'Statistics', icon: BarChart3, color: '#8B5CF6' },
  { id: 'categories', title: 'Categories', icon: Grid3X3, color: '#10B981' },
  { id: 'products', title: 'Products', icon: Package, color: '#3B82F6' },
  { id: 'banners', title: 'Banners', icon: Image, color: '#F59E0B' },
  { id: 'orders', title: 'Orders', icon: Package, color: '#003873' },
  { id: 'customers', title: 'Customers', icon: Users, color: '#003873' },
  { id: 'settings', title: 'Settings', icon: Settings, color: '#414043ff' },
];

export default function AdminScreen({ navigation, route }: any) {
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'banners':
        return <BannersTab />;
      case 'stats':
        return <StatsTab />;
      case 'orders':
        return <OrderTab navigation={navigation} route={route} />;
      case 'customers':
        return <Customers />;
      case 'settings':
        return <AppConfigSettings />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title={StackNames.AdminScreen}
        navigation={navigation}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab?.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && { backgroundColor: tab.color }
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <IconComponent
                size={20}
                color={isActive ? '#FFFFFF' : tab.color}
              />
              <Text style={[
                styles.tabText,
                isActive && { color: '#FFFFFF' }
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.StatusBarBg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12
  },
  headerSpacer: {
    flex: 1
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 65,
    maxHeight: 65
  },
  tabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8
  },
  content: {
    flex: 1
  }
});