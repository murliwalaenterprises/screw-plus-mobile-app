/* eslint-disable radix */

import { Save, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Category } from '../../types/product';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Colors } from '../../constants/Colors';

interface CategoryFormModalProps {
  visible: boolean;
  category: Category | null;
  onClose: () => void;
}

export default function CategoryFormModal({ visible, category, onClose }: CategoryFormModalProps) {
  const { addCategory, updateCategory } = useFirebaseData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    productCount: '0'
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        image: category.image,
        productCount: category.productCount.toString()
      });
    } else {
      setFormData({
        name: '',
        image: '',
        productCount: '0'
      });
    }
  }, [category]);

  const handleSave = async () => {
    if (!formData.name || !formData.image) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const categoryData: Omit<Category, 'id'> = {
        name: formData.name,
        image: formData.image,
        productCount: parseInt(formData.productCount) || 0
      };

      if (category) {
        await updateCategory(category.id, categoryData);
        Alert.alert('Success', 'Category updated successfully');
      } else {
        await addCategory(categoryData);
        Alert.alert('Success', 'Category added successfully');
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {category ? 'Edit Category' : 'Add Category'}
          </Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} automaticallyAdjustKeyboardInsets>
          <View style={styles.field}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g. Men, Women, Accessories"
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Image URL *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.image}
              onChangeText={(text) => setFormData({ ...formData, image: text })}
              placeholder="https://example.com/category-image.jpg"
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Product Count</Text>
            <TextInput
              style={styles.input}
              value={formData.productCount}
              onChangeText={(text) => setFormData({ ...formData, productCount: text })}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
            <Text style={styles.fieldNote}>
              This will be automatically updated based on products in this category
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937'
  },
  saveButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: 'center'
  },
  form: {
    flex: 1
  },
  formContent: {
    padding: 20
  },
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  fieldNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic'
  }
});