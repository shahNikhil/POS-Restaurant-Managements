import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import client, { API_BASE_URL } from '../api/client';

export default function MenuScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({}); // menuItemId -> quantity
  const [customerName, setCustomerName] = useState('');
  const [placing, setPlacing] = useState(false);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/menu');
      setItems(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load the menu. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  function changeQuantity(id, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[id] || 0) + delta;
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  }

  const cartItems = Object.entries(cart).map(([id, quantity]) => {
    const item = items.find((i) => i._id === id);
    return { item, quantity };
  });
  const total = cartItems.reduce((sum, c) => sum + (c.item?.price || 0) * c.quantity, 0);

  async function placeOrder() {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Add at least one item before placing an order.');
      return;
    }
    setPlacing(true);
    try {
      await client.post('/orders', {
        customerName,
        paymentMethod: 'cash',
        items: cartItems.map((c) => ({ menuItemId: c.item._id, quantity: c.quantity })),
      });
      Alert.alert('Order placed', 'Your order has been sent to the kitchen.');
      setCart({});
      setCustomerName('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 220 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl ? (
              <Image source={{ uri: `${API_BASE_URL}${item.imageUrl}` }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Text style={{ color: '#999' }}>No photo</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
              <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable style={styles.qtyButton} onPress={() => changeQuantity(item._id, -1)}>
                <Text style={styles.qtyButtonText}>-</Text>
              </Pressable>
              <Text style={styles.qtyText}>{cart[item._id] || 0}</Text>
              <Pressable style={styles.qtyButton} onPress={() => changeQuantity(item._id, 1)}>
                <Text style={styles.qtyButtonText}>+</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No menu items available yet.</Text>}
      />

      {cartItems.length > 0 && (
        <View style={styles.cartBar}>
          <TextInput
            style={styles.input}
            placeholder="Your name (optional)"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
          <Pressable style={styles.placeOrderButton} onPress={placeOrder} disabled={placing}>
            <Text style={styles.placeOrderText}>{placing ? 'Placing order...' : 'Place Order'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: { width: 64, height: 64, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemDesc: { fontSize: 13, color: '#777', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '600', marginTop: 4, color: '#1f6feb' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  qtyButtonText: { fontSize: 18, fontWeight: '700' },
  qtyText: { minWidth: 20, textAlign: 'center', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 8,
  },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  totalText: { fontSize: 16, fontWeight: '700' },
  placeOrderButton: { backgroundColor: '#1f6feb', padding: 14, borderRadius: 10, alignItems: 'center' },
  placeOrderText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
