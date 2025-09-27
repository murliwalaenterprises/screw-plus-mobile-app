/* eslint-disable radix */
/* eslint-disable react-native/no-inline-styles */

import {
  ChevronDown,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Product } from "../../types/product";
import { useFirebaseData } from "../../store/useFirebaseData";
import { Colors } from "../../constants/Colors";
import { formatCurrency } from "../../services/utilityService";

interface ProductFormModalProps {
  visible: boolean;
  product: Product | any | null;
  onClose: () => void;
}

/** Helper types for dynamic data */
type VariantInput = {
  size?: string;
  color?: string;
  price: string; // keep as string in form, parse at save
  originalPrice?: string;
  stock?: string;
  sku?: string;
  cartonSize?: string;
};

type AttributeInput = { key: string; value: string };

export default function NewProductFormModal({
  visible,
  product,
  onClose,
}: ProductFormModalProps) {
  const { addProduct, updateProduct, categories } = useFirebaseData();

  const [loading, setLoading] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    category: "",
    description: "",
    images: [] as string[], // max 5
    variants: [] as VariantInput[],
    attributes: [] as AttributeInput[],
    isNew: false,
    isBestseller: false,
    isFeatured: false,
    isPublished: true,
    rating: "4.5",
    reviews: "0",
  });

  const [tempImageUrl, setTempImageUrl] = useState("");

  useEffect(() => {
    if (product) {
      // try to read flexible structure if present; otherwise map legacy fields
      const variants: VariantInput[] =
        (product.variants || []).map((v: any) => ({
          size: v.size ?? "",
          color: v.color ?? "",
          price: String(v.price ?? product.price ?? ""),
          originalPrice:
            v.originalPrice != null
              ? String(v.originalPrice)
              : product.originalPrice != null
                ? String(product.originalPrice)
                : "",
          stock:
            v.stock != null ? String(v.stock) : product.stock != null ? String(product.stock) : "",
          sku: v.sku ?? "",
          cartonSize: v.cartonSize ?? 12,
        })) || [];

      const images: string[] = product.images?.length
        ? product.images
        : product.image
          ? [product.image]
          : [];

      setFormData({
        title: product.title || "",
        brand: product.brand || "",
        category: product.category || categories[0]?.name || "",
        description: product.description || "",
        images,
        variants: variants.length ? variants : [{ price: String(product.price || ""), cartonSize: String(product.cartonSize || "12") }],
        attributes: product.attributes || [],
        isNew: !!product.isNew,
        isBestseller: !!product.isBestseller,
        isFeatured: !!product.isFeatured,
        isPublished: product.isPublished !== false, // default true
        rating: String(product.rating ?? "4.5"),
        reviews: String(product.reviews ?? "0"),
      });
    } else {
      setFormData({
        title: "",
        brand: "",
        category: categories[0]?.name || "",
        description: "",
        images: [],
        variants: [{ price: "", cartonSize: '12' }],
        attributes: [],
        isNew: false,
        isBestseller: false,
        isFeatured: false,
        isPublished: true,
        rating: "4.5",
        reviews: "0",
      });
    }
    setTempImageUrl("");
  }, [product, categories]);

  /** ---- Derived helpers ---- */
  const minVariantPrice = useMemo(() => {
    const prices = formData.variants
      .map((v) => parseFloat(v.price))
      .filter((n) => !Number.isNaN(n));
    if (!prices.length) return undefined;
    return Math.min(...prices);
  }, [formData.variants]);

  /** ---- Handlers ---- */
  const addVariant = () => {
    setFormData((p) => ({
      ...p,
      variants: [...p.variants, { price: "" }],
    }));
  };

  const updateVariant = (index: number, patch: Partial<VariantInput>) => {
    setFormData((p) => {
      const next = [...p.variants];
      next[index] = { ...next[index], ...patch };
      return { ...p, variants: next };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((p) => {
      const next = p.variants.filter((_, i) => i !== index);
      return { ...p, variants: next.length ? next : [{ price: "" }] };
    });
  };

  const addAttribute = () => {
    setFormData((p) => ({
      ...p,
      attributes: [...p.attributes, { key: "", value: "" }],
    }));
  };

  const updateAttribute = (index: number, patch: Partial<AttributeInput>) => {
    setFormData((p) => {
      const next = [...p.attributes];
      next[index] = { ...next[index], ...patch } as AttributeInput;
      return { ...p, attributes: next };
    });
  };

  const removeAttribute = (index: number) => {
    setFormData((p) => ({
      ...p,
      attributes: p.attributes.filter((_, i) => i !== index),
    }));
  };

  const addImageByUrl = () => {
    const url = (tempImageUrl || "").trim();
    if (!url) return;
    if (formData.images.length >= 5) {
      Alert.alert("Limit reached", "You can upload a maximum of 5 images.");
      return;
    }
    setFormData((p) => ({ ...p, images: [...p.images, url] }));
    setTempImageUrl("");
  };

  const removeImage = (index: number) => {
    setFormData((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== index),
    }));
  };

  // Hint: for device gallery selection, integrate expo-image-picker:
  // const pickFromGallery = async () => {
  //   const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
  //   if (!result.canceled) addImageByUrlOrUpload(result.assets[0].uri); // upload to storage and push its URL
  // };

  const validate = () => {
    if (!formData.title.trim()) return "Product name is required.";
    if (!formData.category) return "Please select a category.";
    if (!formData.brand.trim()) return "Brand is required.";
    if (!formData.images.length) return "Please add at least one image.";
    if (!formData.variants.length) return "Please add at least one variant.";
    const hasValidPrice = formData.variants.some(
      (v) => v.price && !Number.isNaN(parseFloat(v.price))
    );
    if (!hasValidPrice) return "Please provide price for at least one variant.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Error", err);
      return;
    }
    setLoading(true);
    try {
      // Build flexible product payload
      const normalizedVariants = formData.variants.map((v) => ({
        size: v.size?.trim() || undefined,
        color: v.color?.trim() || undefined,
        price: parseFloat(v.price),
        cartonSize: Number(v.cartonSize),
        originalPrice:
          v.originalPrice && !Number.isNaN(parseFloat(v.originalPrice))
            ? parseFloat(v.originalPrice)
            : undefined,
        stock:
          v.stock && !Number.isNaN(parseInt(v.stock))
            ? parseInt(v.stock)
            : undefined,
        sku: v.sku?.trim() || undefined,
        discount:
          v.originalPrice && parseFloat(v.originalPrice) > 0
            ? Math.round(
              ((parseFloat(v.originalPrice) - parseFloat(v.price)) /
                parseFloat(v.originalPrice)) *
              100
            )
            : undefined,
      }));

      // Keep backward compatibility with your existing Product type
      const legacyPrice = minVariantPrice ?? 0;
      const legacyOriginal =
        normalizedVariants.find((v) => v.originalPrice)?.originalPrice;
      const legacyDiscount =
        legacyOriginal && legacyOriginal > 0
          ? Math.round(((legacyOriginal - legacyPrice) / legacyOriginal) * 100)
          : undefined;

      const productData: Omit<Product, "id"> & any = {
        title: formData.title.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        description: formData.description.trim(),
        rating: parseFloat(formData.rating) || 4.5,
        reviews: parseInt(formData.reviews) || 0,
        // legacy fields (safe for your existing list UI)
        price: legacyPrice,
        originalPrice: legacyOriginal,
        discount: legacyDiscount,
        image: formData.images[0], // first image as primary
        // new flexible fields
        images: formData.images,
        variants: normalizedVariants,
        attributes: formData.attributes.filter(
          (a) => a.key.trim() && a.value.trim()
        ),
        isNew: formData.isNew,
        isBestseller: formData.isBestseller,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
        updatedAt: Date.now(),
      };

      if (product?.id) {
        await updateProduct(product.id, productData);
        Alert.alert("Success", "Product updated successfully");
      } else {
        await addProduct(productData);
        Alert.alert("Success", "Product added successfully");
      }
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  /** ---- Render ---- */
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {product ? "Edit Product" : "Add Product"}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={'#222'} />
            ) : (
              <Text style={styles.title}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={styles.formContent}
          automaticallyAdjustKeyboardInsets
        >
          {/* Product basics */}
          <View style={styles.field}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, title: text }))
              }
              placeholder="e.g. Metal Screws"
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1, { marginRight: 8 }]}>
              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                value={formData.brand}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, brand: text }))
                }
                placeholder="e.g. GK Traders"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>

            <View style={[styles.field, styles.flex1, { marginLeft: 8 }]}>
              <Text style={styles.label}>Category *</Text>
              <TouchableOpacity
                style={[styles.input, styles.select]}
                onPress={() => setCategoryPickerOpen(true)}
              >
                <Text
                  style={{
                    color: formData.category ? "#1F2937" : Colors.light.placeholderTextColor,
                  }}
                >
                  {formData.category || "Select category"}
                </Text>
                <ChevronDown size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Images */}
          <View style={styles.field}>
            <Text style={styles.label}>Images (max 5)</Text>

            <View style={styles.imageList}>
              {formData.images.map((uri, idx) => (
                <View key={idx} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} />
                  <TouchableOpacity
                    style={styles.removeBadge}
                    onPress={() => removeImage(idx)}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {formData.images.length < 5 && (
                <View style={[styles.thumbWrap, styles.thumbAdd]}>
                  <PlusCircle size={26} color="#6B7280" />
                </View>
              )}
            </View>

            <View style={[styles.row, { marginTop: 8 }]}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="https://example.com/image.jpg"
                value={tempImageUrl}
                onChangeText={setTempImageUrl}
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
              <TouchableOpacity style={styles.pillButton} onPress={addImageByUrl}>
                <Text style={styles.pillText}>Add URL</Text>
              </TouchableOpacity>
            </View>

            {/* If using device gallery, add a button here and call pickFromGallery() */}
          </View>

          {/* Variants */}
          <View style={styles.field}>
            <Text style={styles.label}>Variants *</Text>
            {formData.variants.map((v, i) => (
              <View key={i} style={styles.variantCard}>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.flex1, { marginRight: 8 }]}
                    placeholder="Size (e.g. 6.5 / M)"
                    value={v.size ?? ""}
                    onChangeText={(t) => updateVariant(i, { size: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                  <TextInput
                    style={[styles.input, styles.flex1, { marginLeft: 8 }]}
                    placeholder="Color (e.g. Silver)"
                    value={v.color ?? ""}
                    onChangeText={(t) => updateVariant(i, { color: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                </View>

                <View style={[styles.row, { marginTop: 10 }]}>
                  <TextInput
                    style={[styles.input, styles.flex1, { marginRight: 8 }]}
                    placeholder="Price *"
                    keyboardType="numeric"
                    value={v.price}
                    onChangeText={(t) => updateVariant(i, { price: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                  <TextInput
                    style={[styles.input, styles.flex1, { marginLeft: 8 }]}
                    placeholder="Original Price"
                    keyboardType="numeric"
                    value={v.originalPrice ?? ""}
                    onChangeText={(t) => updateVariant(i, { originalPrice: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                </View>

                <View style={[styles.row, { marginTop: 10 }]}>
                  <TextInput
                    style={[styles.input, styles.flex1, { marginRight: 8 }]}
                    placeholder="Stock"
                    keyboardType="numeric"
                    value={v.stock ?? ""}
                    onChangeText={(t) => updateVariant(i, { stock: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                  <TextInput
                    style={[styles.input, styles.flex1, { marginLeft: 8 }]}
                    placeholder="SKU"
                    value={v.sku ?? ""}
                    onChangeText={(t) => updateVariant(i, { sku: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                </View>

                <View style={[styles.row, { marginTop: 10 }]}>
                  <TextInput
                    style={[styles.input, styles.flex1, { marginRight: 8 }]}
                    placeholder="Carton Size"
                    keyboardType="numeric"
                    value={v.cartonSize ?? ""}
                    onChangeText={(t) => updateVariant(i, { cartonSize: t })}
                    placeholderTextColor={Colors.light.placeholderTextColor}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => removeVariant(i)}
                  style={styles.removeRow}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={styles.removeText}>Remove variant</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity onPress={addVariant} style={styles.addRow}>
              <PlusCircle size={18} color="#3B82F6" />
              <Text style={styles.addText}>Add Variant</Text>
            </TouchableOpacity>

            {minVariantPrice != null && (
              <Text style={styles.helper}>
                Min price: {formatCurrency(minVariantPrice)}
              </Text>
            )}
          </View>

          {/* Extra attributes */}
          <View style={styles.field}>
            <Text style={styles.label}>Additional Details</Text>
            {formData.attributes.map((attr, i) => (
              <View key={i} style={[styles.row, { marginBottom: 10 }]}>
                <TextInput
                  style={[styles.input, styles.flex1, { marginRight: 8 }]}
                  placeholder="Key (e.g. Material)"
                  value={attr.key}
                  onChangeText={(t) => updateAttribute(i, { key: t })}
                  placeholderTextColor={Colors.light.placeholderTextColor}
                />
                <TextInput
                  style={[styles.input, styles.flex1, { marginLeft: 8 }]}
                  placeholder="Value (e.g. Metal)"
                  value={attr.value}
                  onChangeText={(t) => updateAttribute(i, { value: t })}
                  placeholderTextColor={Colors.light.placeholderTextColor}
                />
                <TouchableOpacity
                  onPress={() => removeAttribute(i)}
                  style={styles.iconBtn}
                >
                  <Trash2 size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addAttribute} style={styles.addRow}>
              <PlusCircle size={18} color="#3B82F6" />
              <Text style={styles.addText}>Add Attribute</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((p) => ({ ...p, description: text }))
              }
              placeholder="Write a detailed description..."
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.light.placeholderTextColor}
            />
          </View>

          {/* Display settings */}
          <View style={styles.toggles}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Mark as New</Text>
              <Switch
                value={formData.isNew}
                onValueChange={(v) => setFormData((p) => ({ ...p, isNew: v }))}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Bestseller</Text>
              <Switch
                value={formData.isBestseller}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, isBestseller: v }))
                }
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Featured</Text>
              <Switch
                value={formData.isFeatured}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, isFeatured: v }))
                }
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Published</Text>
              <Switch
                value={formData.isPublished}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, isPublished: v }))
                }
              />
            </View>
          </View>

          {/* Ratings (optional) */}
          <View style={styles.row}>
            <View style={[styles.field, styles.flex1, { marginRight: 8 }]}>
              <Text style={styles.label}>Rating</Text>
              <TextInput
                style={styles.input}
                value={formData.rating}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, rating: text }))
                }
                placeholder="4.5"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
            <View style={[styles.field, styles.flex1, { marginLeft: 8 }]}>
              <Text style={styles.label}>Reviews</Text>
              <TextInput
                style={styles.input}
                value={formData.reviews}
                onChangeText={(text) =>
                  setFormData((p) => ({ ...p, reviews: text }))
                }
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={Colors.light.placeholderTextColor}
              />
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {/* Category Picker Modal */}
        <Modal
          visible={categoryPickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryPickerOpen(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.categoryCard}>
              <Text style={styles.catTitle}>Select Category</Text>
              <ScrollView style={{ maxHeight: 320 }}>
                {categories.map((c: any) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.catOption,
                      formData.category === c.name && styles.catOptionActive,
                    ]}
                    onPress={() => {
                      setFormData((p) => ({ ...p, category: c.name }));
                      setCategoryPickerOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.catOptionText,
                        formData.category === c.name && styles.catOptionTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setCategoryPickerOpen(false)}
                style={[styles.pillButton, { alignSelf: "flex-end" }]}
              >
                <Text style={styles.pillText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#1F2937" },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
  },

  form: { flex: 1 },
  formContent: { padding: 20 },

  field: { marginBottom: 18 },
  label: { fontSize: 16, fontWeight: "500", color: "#374151", marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  textArea: { height: 110, textAlignVertical: "top" },

  row: { flexDirection: "row", alignItems: "flex-start" },
  flex1: { flex: 1 },

  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // Images
  imageList: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  thumb: { width: "100%", height: "100%" },
  thumbAdd: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  removeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  pillButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillText: { color: "#fff", fontWeight: "600" },

  // Variants
  variantCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  addRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  addText: { color: "#3B82F6", marginLeft: 6, fontWeight: "600" },
  helper: { marginTop: 6, color: "#6B7280" },
  removeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  removeText: { color: "#EF4444", marginLeft: 6, fontWeight: "600" },
  iconBtn: {
    height: 44,
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  // Toggles
  toggles: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
    marginTop: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleLabel: { fontSize: 15, color: "#374151" },

  // Category modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    padding: 20,
  },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  catTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8, color: "#111827" },
  catOption: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  catOptionActive: { backgroundColor: "#3B82F6", borderColor: "#3B82F6" },
  catOptionText: { color: "#374151", fontWeight: "500" },
  catOptionTextActive: { color: "#fff" },
});
