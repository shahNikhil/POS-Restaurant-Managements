import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import client, { API_BASE_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', description: '', price: '', category: '', isAvailable: true };

export default function AdminMenuScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null); // { uri, name, type }
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const { data } = await client.get('/menu/all');
      setItems(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load menu items');
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setImage(null);
    setModalVisible(true);
  }

  function openEditModal(item) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      isAvailable: item.isAvailable,
    });
    setImage(null);
    setModalVisible(true);
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, name: asset.fileName || 'photo.jpg', type: 'image/jpeg' });
    }
  }

  async function saveItem() {
    if (!form.name || !form.price) {
      Alert.alert('Missing info', 'Name and price are required.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('category', form.category);
      formData.append('isAvailable', String(form.isAvailable));
      if (image) {
        formData.append('image', { uri: image.uri, name: image.name, type: image.type });
      }

      if (editingId) {
        await client.put(`/menu/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await client.post('/menu', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setModalVisible(false);
      loadItems();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not save item');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(item) {
    Alert.alert('Delete item', `Remove "${item.name}" from the menu?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/menu/${item._id}`);
            loadItems();
          } catch (err) {
            Alert.alert('Error', 'Could not delete item');
          }
        },
      },
    ]);
  }

  async function handleLogout() {
    await logout();
    navigation.replace('Home');
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Superadmin: {user?.name}</Text>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>

      <Pressable style={styles.addButton} onPress={openCreateModal}>
        <Text style={styles.addButtonText}>+ Add Menu Item</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
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
              <Text style={styles.itemMeta}>
                ${item.price.toFixed(2)} · {item.category} · {item.isAvailable ? 'available' : 'hidden'}
              </Text>
            </View>
            <View style={{ gap: 6 }}>
              <Pressable style={styles.smallButton} onPress={() => openEditModal(item)}>
                <Text style={styles.smallButtonText}>Edit</Text>
              </Pressable>
              <Pressable style={[styles.smallButton, styles.deleteButton]} onPress={() => confirmDelete(item)}>
                <Text style={styles.smallButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No menu items yet. Add your first one.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingId ? 'Edit Item' : 'New Item'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="decimal-pad"
            value={form.price}
            onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Category (e.g. Starters, Drinks)"
            value={form.category}
            onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
          />

          <Pressable style={styles.imagePickerButton} onPress={pickImage}>
            <Text style={styles.imagePickerText}>{image ? 'Photo selected ✓' : 'Choose Photo'}</Text>
          </Pressable>
          {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}

          <Pressable
            style={styles.availabilityRow}
            onPress={() => setForm((f) => ({ ...f, isAvailable: !f.isAvailable }))}
          >
            <Text>{form.isAvailable ? '✅ Available on menu' : '⬜ Hidden from menu'}</Text>
          </Pressable>

          <Pressable style={styles.saveButton} onPress={saveItem} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerText: { fontSize: 14, color: '#555' },
  logoutText: { color: '#c0392b', fontWeight: '600' },
  addButton: { backgroundColor: '#1f6feb', margin: 16, padding: 14, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  image: { width: 56, height: 56, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemMeta: { fontSize: 13, color: '#777', marginTop: 2 },
  smallButton: { backgroundColor: '#eee', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  deleteButton: { backgroundColor: '#fdecea' },
  smallButtonText: { fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },
  modalContent: { padding: 24, gap: 12 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16 },
  imagePickerButton: { backgroundColor: '#eee', padding: 14, borderRadius: 10, alignItems: 'center' },
  imagePickerText: { fontWeight: '600' },
  previewImage: { width: 120, height: 120, borderRadius: 10, alignSelf: 'center' },
  availabilityRow: { paddingVertical: 8 },
  saveButton: { backgroundColor: '#1f6feb', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: { padding: 14, alignItems: 'center' },
  cancelButtonText: { color: '#555' },
});
