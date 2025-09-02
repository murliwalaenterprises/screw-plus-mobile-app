
import {
  Bell,
  ChevronRight,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Star,
  User
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNames } from '../constants/stackNames';

interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  locationServices: boolean;
  analytics: boolean;
  autoUpdate: boolean;
}

export default function SettingsScreen({navigation}: any) {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    notifications: true,
    locationServices: true,
    analytics: false,
    autoUpdate: true,
  });

  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('User logged out');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Account deletion requested');
          },
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <ChevronRight size={20} color="#ccc" />)}
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your app experience</Text>
        </View>

        {renderSection('Account', (
          <>
            {renderSettingItem(
              <User size={20} color="#3742fa" />,
              'Edit Profile',
              'Update your personal information',
              () => {
                console.log('Edit profile');
                navigation.navigate(StackNames.EditProfile);
              }
            )}
            {renderSettingItem(
              <Shield size={20} color="#2ed573" />,
              'Privacy & Security',
              'Manage your privacy settings',
              () => console.log('Privacy settings')
            )}
          </>
        ))}

        {renderSection('Preferences', (
          <>
            {renderSettingItem(
              <Moon size={20} color="#333" />,
              'Dark Mode',
              'Switch to dark theme',
              undefined,
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => updateSetting('darkMode', value)}
                trackColor={{ false: '#e9ecef', true: '#333' }}
                thumbColor="#fff"
              />
            )}
            {renderSettingItem(
              <Bell size={20} color="#ffa502" />,
              'Notifications',
              'Enable push notifications',
              undefined,
              <Switch
                value={settings.notifications}
                onValueChange={(value) => updateSetting('notifications', value)}
                trackColor={{ false: '#e9ecef', true: '#ffa502' }}
                thumbColor="#fff"
              />
            )}
            {renderSettingItem(
              <Globe size={20} color="#ff4757" />,
              'Location Services',
              'Allow location access',
              undefined,
              <Switch
                value={settings.locationServices}
                onValueChange={(value) => updateSetting('locationServices', value)}
                trackColor={{ false: '#e9ecef', true: '#ff4757' }}
                thumbColor="#fff"
              />
            )}
          </>
        ))}

        {renderSection('App Settings', (
          <>
            {renderSettingItem(
              <Globe size={20} color="#666" />,
              'Language',
              'English (US)',
              () => console.log('Language settings')
            )}
            {renderSettingItem(
              <Shield size={20} color="#666" />,
              'Analytics',
              'Help improve the app',
              undefined,
              <Switch
                value={settings.analytics}
                onValueChange={(value) => updateSetting('analytics', value)}
                trackColor={{ false: '#e9ecef', true: '#666' }}
                thumbColor="#fff"
              />
            )}
            {renderSettingItem(
              <Globe size={20} color="#666" />,
              'Auto Update',
              'Automatically update the app',
              undefined,
              <Switch
                value={settings.autoUpdate}
                onValueChange={(value) => updateSetting('autoUpdate', value)}
                trackColor={{ false: '#e9ecef', true: '#666' }}
                thumbColor="#fff"
              />
            )}
          </>
        ))}

        {renderSection('Support', (
          <>
            {renderSettingItem(
              <HelpCircle size={20} color="#3742fa" />,
              'Help Center',
              'Get help and support',
              () => console.log('Help center')
            )}
            {renderSettingItem(
              <Star size={20} color="#ffa502" />,
              'Rate App',
              'Rate us on the app store',
              () => console.log('Rate app')
            )}
            {renderSettingItem(
              <FileText size={20} color="#666" />,
              'Terms of Service',
              'Read our terms and conditions',
              () => console.log('Terms of service')
            )}
            {renderSettingItem(
              <FileText size={20} color="#666" />,
              'Privacy Policy',
              'Read our privacy policy',
              () => console.log('Privacy policy')
            )}
          </>
        ))}

        <View style={styles.dangerZone}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#ff4757" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Screw Plus v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ in India</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  dangerZone: {
    marginTop: 24,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4757',
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  deleteText: {
    fontSize: 16,
    color: '#ff4757',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});