/* eslint-disable react-native/no-inline-styles */
/* eslint-disable radix */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { Category } from '../../types/product';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Colors } from '../../constants/Colors';
import { HeaderRow } from '../ui';
import { verticalScale } from 'react-native-size-matters';

interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
}

export default function CategoryFormModal({ category, onClose }: CategoryFormModalProps) {
  const { addCategory, updateCategory } = useFirebaseData();
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
    }
  };

  return (
    <>
      {/* Header */}
      <HeaderRow
        title={`${category ? "Edit categories's details" : 'Add new category'}`}
        buttonText="Save"
        onPress={() => handleSave()}
        containerStyle={{ marginBottom: verticalScale(20) }}
      />
      <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20 }}>
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
      </View>
    </>
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