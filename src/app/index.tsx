
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  deleteProduct,
  getProducts,
  initializeDatabase,
  addProduct as saveProductToDatabase,
  type Product,
} from './database/database';

type Category =
  | 'Skincare'
  | 'Haircare'
  | 'Makeup'
  | 'Fragrance'
  | 'Supplements'
  | 'Other';

const categories: Category[] = [
  'Skincare',
  'Haircare',
  'Makeup',
  'Fragrance',
  'Supplements',
  'Other',
];

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<Category>('Skincare');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    let active = true;

    async function loadInventory() {
      try {
        await initializeDatabase();
        const savedProducts = await getProducts();

        if (active) {
          setProducts(savedProducts);
        }
      } catch (error) {
        console.error('Failed to load inventory:', error);
        if (active) {
          Alert.alert(
            'Database error',
            'We could not load your inventory. Please try reopening the app.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInventory();

    return () => {
      active = false;
    };
  }, []);

  const inventoryValue = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const filteredProducts = products.filter((product) => {
  const query = searchQuery.trim().toLowerCase();

  return (
    product.name.toLowerCase().includes(query) ||
    product.brand.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query)
  );
});

  async function addProduct() {
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    if (!name.trim()) {
      Alert.alert('Product name required', 'Enter a product name.');
      return;
    }

    if (
      price.trim() === '' ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      Alert.alert('Check the price', 'Enter a valid price of zero or more.');
      return;
    }

    if (
      quantity.trim() === '' ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      Alert.alert('Check the quantity', 'Enter a whole number of 1 or more.');
      return;
    }

    setSaving(true);

    try {
      await saveProductToDatabase({
        name: name.trim(),
        brand: brand.trim() || 'Brand not specified',
        category,
        price: parsedPrice,
        quantity: parsedQuantity,
      });

      const savedProducts = await getProducts();
      setProducts(savedProducts);

      setName('');
      setBrand('');
      setCategory('Skincare');
      setPrice('');
      setQuantity('1');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      Alert.alert(
        'Could not save product',
        'Your product was not saved successfully. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
  Alert.alert(
    'Delete Product',
    `Are you sure you want to delete "${product.name}"?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);

            const updatedProducts = await getProducts();
            setProducts(updatedProducts);
          } catch (error) {
            console.error('Error deleting product:', error);

            Alert.alert(
              'Error',
              'Could not delete this product. Please try again.'
            );
          }
        },
      },
    ]
  );
}

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#49372F" />
        <Text style={styles.muted}>Loading your collection...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>YOUR PERSONAL WELLNESS SPACE</Text>
      <Text style={styles.title}>Beauty Vault</Text>
      <Text style={styles.subtitle}>
        Everything you use. Everything you need.
      </Text>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>PRODUCTS</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>INVENTORY VALUE</Text>
          <Text style={styles.summaryValue}>
            ${inventoryValue.toFixed(2)}
          </Text>
        </View>
      </View>

      <TextInput
  style={styles.input}
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search products, brands, categories..."
  placeholderTextColor="#A99A91"
  autoCapitalize="none"
  returnKeyType="search"
/>
      <View style={styles.sectionHeader}>
        <View style={styles.headingText}>
          <Text style={styles.sectionTitle}>My collection</Text>
          <Text style={styles.muted}>
            Beauty, skincare, haircare and supplements
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm((visible) => !visible)}
          disabled={saving}
        >
          <Text style={styles.addButtonText}>
            {showForm ? 'Cancel' : '+ Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>Add a product</Text>

          <Text style={styles.label}>Product name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Daily Facial Moisturizer"
            placeholderTextColor="#A99A91"
          />

          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. CeraVe"
            placeholderTextColor="#A99A91"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryOptions}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryChip,
                  category === item && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === item && styles.categoryChipTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Price per item (USD) *</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="e.g. 24.99"
            placeholderTextColor="#A99A91"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Quantity owned *</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            placeholderTextColor="#A99A91"
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={addProduct}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save product'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧴</Text>
          <Text style={styles.emptyTitle}>Your collection starts here</Text>
          <Text style={styles.muted}>
            Add your first beauty product or supplement to begin building
            your inventory.
          </Text>
          {!showForm && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.saveButtonText}>Add your first product</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.productList}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productIcon}>
                <Text style={styles.productEmoji}>
                  {product.category === 'Supplements' ? '💊' : '🧴'}
                </Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.muted}>{product.brand}</Text>
                <Text style={styles.productCategory}>
                  {product.category} · Qty {product.quantity}
                </Text>
              </View>
              <Text style={styles.productPrice}>
                ${(product.price * product.quantity).toFixed(2)}
              </Text>

<TouchableOpacity
  onPress={() => handleDeleteProduct(product)}
  style={{
    backgroundColor: '#F8E8E5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  }}
>
  <Text style={{ color: '#A33B32', fontSize: 12, fontWeight: '600' }}>
    Delete
  </Text>
</TouchableOpacity>

            </View>
          ))}
        </View>
      )}

      <Text style={styles.footer}>
        YOUR ROUTINE. YOUR RESEARCH. YOUR BUDGET.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF7F4' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 48 },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FAF7F4',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#98776B',
    fontWeight: '700',
    marginBottom: 12,
  },
  title: { fontSize: 36, fontWeight: '700', color: '#352720' },
  subtitle: {
    fontSize: 14,
    color: '#81736D',
    marginTop: 8,
    marginBottom: 24,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: '#49372F',
    padding: 22,
    borderRadius: 20,
    marginBottom: 32,
  },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 10, letterSpacing: 1, color: '#E8DAD0' },
  summaryValue: {
    fontSize: 25,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
  },
  headingText: { flex: 1 },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#352720',
    marginBottom: 5,
  },
  muted: { fontSize: 13, color: '#897C75', lineHeight: 19 },
  addButton: {
    backgroundColor: '#49372F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600' },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F0E8E2',
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#352720',
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#49372F',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FAF7F4',
    borderWidth: 1,
    borderColor: '#E9DED6',
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
    color: '#352720',
  },
  categoryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#E9DED6',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryChipSelected: {
    backgroundColor: '#49372F',
    borderColor: '#49372F',
  },
  categoryChipText: { color: '#49372F', fontSize: 12 },
  categoryChipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#49372F',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0E8E2',
  },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#352720',
    marginBottom: 8,
  },
  productList: { gap: 12 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0E8E2',
  },
  productIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EFE6DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productEmoji: { fontSize: 22 },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#352720',
    marginBottom: 3,
  },
  productCategory: { fontSize: 11, color: '#98776B', marginTop: 4 },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#49372F',
    marginLeft: 8,
  },
  footer: {
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: 'center',
    color: '#A18D81',
    marginTop: 32,
  },
});
