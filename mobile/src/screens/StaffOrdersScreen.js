import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl, Alert } from 'react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const NEXT_STATUS = {
  received: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

export default function StaffOrdersScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await client.get('/orders');
      setOrders(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load orders');
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function onRefresh() {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }

  async function advanceStatus(order) {
    const next = NEXT_STATUS[order.orderStatus];
    if (!next) return;
    try {
      await client.patch(`/orders/${order._id}`, { orderStatus: next });
      loadOrders();
    } catch (err) {
      Alert.alert('Error', 'Could not update order');
    }
  }

  async function handleLogout() {
    await logout();
    navigation.replace('Home');
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Signed in as {user?.name}</Text>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.orderName}>{item.customerName || 'Walk-in customer'}</Text>
              <Text style={styles.total}>${item.total.toFixed(2)}</Text>
            </View>
            {item.items.map((line, idx) => (
              <Text key={idx} style={styles.lineItem}>
                {line.quantity}x {line.name}
              </Text>
            ))}
            <View style={styles.rowBetween}>
              <Text style={styles.badge}>Order: {item.orderStatus}</Text>
              <Text style={[styles.badge, item.paymentStatus === 'paid' ? styles.paid : styles.pending]}>
                Payment: {item.paymentStatus} ({item.paymentMethod})
              </Text>
            </View>
            {NEXT_STATUS[item.orderStatus] && (
              <Pressable style={styles.advanceButton} onPress={() => advanceStatus(item)}>
                <Text style={styles.advanceButtonText}>
                  Mark as {NEXT_STATUS[item.orderStatus]}
                </Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No orders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: { fontSize: 14, color: '#555' },
  logoutText: { color: '#c0392b', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, gap: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderName: { fontSize: 16, fontWeight: '700' },
  total: { fontSize: 16, fontWeight: '700', color: '#1f6feb' },
  lineItem: { fontSize: 14, color: '#555' },
  badge: { fontSize: 12, fontWeight: '600', color: '#555' },
  paid: { color: '#1a7f37' },
  pending: { color: '#c0392b' },
  advanceButton: { backgroundColor: '#1f6feb', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  advanceButtonText: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
});
