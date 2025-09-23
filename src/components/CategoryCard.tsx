import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../types/product';
import { useStore } from '../store/useStore';
import { StackNames } from '../constants/StackNames';
import { AppText } from './ui';

interface CategoryCardProps {
  navigation: any;
  category: Category;
}

export default function CategoryCard({ navigation, category }: CategoryCardProps) {
  const { setSelectedCategory } = useStore();

  const handlePress = () => {
    setSelectedCategory(category.name);
    navigation.navigate(StackNames.ProductListScreen, { query: { title: category.name, category: category.name } })
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: category.image }} style={styles.image} />
      <View style={styles.overlay}>
        <AppText variant="small" style={styles.name}>{category.name}</AppText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  name: {
    color: '#fff',
  },
  count: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
});