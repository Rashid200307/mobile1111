import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFinanceStore } from '@/lib/store';
import { ShoppingBag, Coffee, Car, Chrome as Home, Plus } from 'lucide-react-native';

const defaultCategories = [
  { id: '1', name: 'Shopping', icon: ShoppingBag, color: '#007AFF' },
  { id: '2', name: 'Food', icon: Coffee, color: '#5856D6' },
  { id: '3', name: 'Transport', icon: Car, color: '#FF2D55' },
  { id: '4', name: 'Bills', icon: Home, color: '#FF9500' },
  { id: 'custom', name: 'Custom', icon: Plus, color: '#8e8e93' },
];

const presetColors = ['#007AFF', '#FF9500', '#5856D6', '#FF2D55', '#34C759', '#8e8e93'];

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const transaction = useFinanceStore(state => state.transactions.find(t => t.id === id));
  const updateTransaction = useFinanceStore(state => state.updateTransaction);

  // Local state for the form fields.
  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [note, setNote] = useState(transaction ? transaction.note : '');
  const [category, setCategory] = useState(transaction ? transaction.category : '');

  // For custom category details.
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    if (!transaction) {
      Alert.alert("Error", "Transaction not found.");
      router.back();
    } else {
      const isDefault = defaultCategories.some(cat => cat.name === transaction.category);
      if (!isDefault) {
        setCategory('custom');
        setCustomCategoryName(transaction.category);
        setCustomCategoryColor((transaction as any).customColor || '');
      } else {
        setCategory(transaction.category);
      }
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) {
      Alert.alert("Error", "Invalid amount. Please enter a valid number.");
      return;
    }

    let finalCategory = '';
    if (category === 'custom') {
      if (!customCategoryName.trim()) {
        Alert.alert('Error', 'Please enter a custom category name');
        return;
      }
      finalCategory = customCategoryName.trim();
    } else {
      finalCategory = category;
    }

    updateTransaction(transaction.id, {
      amount: parsedAmount,
      note,
      category: finalCategory,
      ...(category === 'custom' && { customColor: customCategoryColor }),
    });
    router.back();
  };

  const handleCategorySelect = (cat: typeof defaultCategories[0]) => {
    setCategory(cat.id);
    if (cat.id === 'custom') {
      setShowCustomModal(true);
    } else {
      setCustomCategoryName('');
      setCustomCategoryColor('');
    }
  };

  const previewColor = customCategoryColor.trim() !== '' ? customCategoryColor.trim().toLowerCase() : '#ffffff';

  const renderPresetColors = () => (
    <View style={styles.presetColorsContainer}>
      {presetColors.map(color => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorSwatch,
            { backgroundColor: color },
            color === previewColor && styles.selectedSwatch,
          ]}
          onPress={() => setCustomCategoryColor(color)}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Transaction</Text>
          </View>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Amount"
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          <Text style={styles.label}>Select Category</Text>
          <View style={styles.categoriesGrid}>
            {defaultCategories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.selectedCategory,
                ]}
                onPress={() => handleCategorySelect(cat)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                  <cat.icon size={24} color="white" />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {category === 'custom' && (
            <View style={styles.customContainer}>
              <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                value={customCategoryName}
                onChangeText={setCustomCategoryName}
                placeholder="Custom Category Name"
                placeholderTextColor="#666"
              />
              <Text style={styles.label}>Select a Color:</Text>
              {renderPresetColors()}
              <TextInput
                style={[styles.input, styles.colorInput]}
                placeholder="Color (name or hex code)"
                placeholderTextColor="#666"
                value={customCategoryColor}
                onChangeText={text => setCustomCategoryColor(text.toLowerCase())}
              />
              <View style={[styles.colorPreview, { backgroundColor: previewColor }]}>
                <Text style={styles.colorPreviewText}>Color Preview</Text>
              </View>
            </View>
          )}
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="Note"
            multiline
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>

          {/* Custom Category Modal */}
          <Modal visible={showCustomModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Custom Category Details</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Category Name"
                  value={customCategoryName}
                  onChangeText={setCustomCategoryName}
                  placeholderTextColor="#666"
                />
                <Text style={styles.modalSubtitle}>Select a Color</Text>
                {renderPresetColors()}
                <TextInput
                  style={[styles.modalInput, styles.colorInput]}
                  placeholder="Color (name or hex code)"
                  placeholderTextColor="#666"
                  value={customCategoryColor}
                  onChangeText={text => setCustomCategoryColor(text.toLowerCase())}
                />
                <View style={[styles.colorPreview, { backgroundColor: previewColor }]}>
                  <Text style={styles.colorPreviewText}>Color Preview</Text>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowCustomModal(false);
                      setCategory('');
                      setCustomCategoryName('');
                      setCustomCategoryColor('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => {
                      if (!customCategoryName.trim()) {
                        Alert.alert('Error', 'Please enter a custom category name');
                        return;
                      }
                      setShowCustomModal(false);
                    }}
                  >
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    color: '#1c1c1e',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f2f2f7',
    color: '#1c1c1e',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 10,
  },
  categoryButton: {
    width: '25%',
    padding: 8,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    textAlign: 'center',
  },
  customContainer: {
    marginBottom: 15,
  },
  presetColorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedSwatch: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1c1c1e',
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 10,
    color: '#1c1c1e',
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Inter-Bold',
  },
  colorInput: {
    borderColor: '#ccc',
    borderWidth: 1,
  },
  colorPreview: {
    height: 40,
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorPreviewText: {
    color: 'white',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
