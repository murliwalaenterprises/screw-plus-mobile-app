
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
import { Product } from '../../types/product';
import { useFirebaseData } from '../../store/useFirebaseData';
import { Colors } from '../../constants/Colors';

interface ProductFormModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
}

export default function ProductFormModal({ visible, product, onClose }: ProductFormModalProps) {
  const { addProduct, updateProduct, categories } = useFirebaseData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    originalPrice: '',
    image: '',
    category: '',
    brand: '',
    rating: '4.5',
    reviews: '0',
    sizes: 'S,M,L,XL',
    colors: 'White,Black,Navy',
    description: '',
    isNew: false,
    isBestseller: false
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        image: product.image,
        category: product.category,
        brand: product.brand,
        rating: product.rating.toString(),
        reviews: product.reviews.toString(),
        sizes: product.sizes.join(','),
        colors: product.colors.join(','),
        description: product.description,
        isNew: product.isNew || false,
        isBestseller: product.isBestseller || false
      });
    } else {
      setFormData({
        title: '',
        price: '',
        originalPrice: '',
        image: '',
        category: categories[0]?.name || '',
        brand: 'Screw Plus',
        rating: '4.5',
        reviews: '0',
        sizes: 'S,M,L,XL',
        colors: 'White,Black,Navy',
        description: '',
        isNew: false,
        isBestseller: false
      });
    }
  }, [product, categories]);

  const handleSave = async () => {
    if (!formData.title || !formData.price || !formData.image || !formData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const productData: Omit<any, 'id'> = {
        title: formData.title,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.originalPrice 
          ? Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)
          : undefined,
        image: formData.image,
        category: formData.category,
        brand: formData.brand,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        sizes: formData.sizes.split(',').map(s => s.trim()),
        colors: formData.colors.split(',').map(c => c.trim()),
        description: formData.description,
        isNew: formData.isNew,
        isBestseller: formData.isBestseller
      };

      if (product) {
        await updateProduct(product.id, productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await addProduct(productData);
        Alert.alert('Success', 'Product added successfully');
      }
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
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
            {product ? 'Edit Product' : 'Add Product'}
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
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Product title"
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="999"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Original Price</Text>
              <TextInput
                style={styles.input}
                value={formData.originalPrice}
                onChangeText={(text) => setFormData({ ...formData, originalPrice: text })}
                placeholder="1499"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Image URL *</Text>
            <TextInput
              style={styles.input}
              value={formData.image}
              onChangeText={(text) => setFormData({ ...formData, image: text })}
              placeholder="https://example.com/image.jpg"
              multiline
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.pickerContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.pickerOption,
                      formData.category === category.name && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, category: category.name })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.category === category.name && styles.pickerOptionTextSelected
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Brand</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
                placeholder="Brand name"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Rating</Text>
              <TextInput
                style={styles.input}
                value={formData.rating}
                onChangeText={(text) => setFormData({ ...formData, rating: text })}
                placeholder="4.5"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Reviews</Text>
              <TextInput
                style={styles.input}
                value={formData.reviews}
                onChangeText={(text) => setFormData({ ...formData, reviews: text })}
                placeholder="128"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Sizes (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.sizes}
              onChangeText={(text) => setFormData({ ...formData, sizes: text })}
              placeholder="S,M,L,XL,XXL"
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Colors (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={formData.colors}
              onChangeText={(text) => setFormData({ ...formData, colors: text })}
              placeholder="White,Black,Navy,Red"
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Product description"
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, isNew: !formData.isNew })}
            >
              <View style={[styles.checkboxBox, formData.isNew && styles.checkboxBoxChecked]}>
                {formData.isNew && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mark as New</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, isBestseller: !formData.isBestseller })}
            >
              <View style={[styles.checkboxBox, formData.isBestseller && styles.checkboxBoxChecked]}>
                {formData.isBestseller && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Mark as Bestseller</Text>
            </TouchableOpacity>
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
    backgroundColor: '#3B82F6',
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
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
    height: 100,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  pickerOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#6B7280'
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF'
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxBoxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6'
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151'
  }
});