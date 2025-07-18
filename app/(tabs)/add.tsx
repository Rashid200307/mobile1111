import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActionSheetIOS,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
} from 'react-native';
import { CreditCard, ShoppingBag, Coffee, Car, Chrome as Home, Plus } from 'lucide-react-native';
import { useFinanceStore } from '@/lib/store';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const defaultCategories = [
  { id: '1', name: 'Shopping', icon: ShoppingBag, color: '#007AFF' },
  { id: '2', name: 'Food', icon: Coffee, color: '#5856D6' },
  { id: '3', name: 'Transport', icon: Car, color: '#FF2D55' },
  { id: '4', name: 'Bills', icon: Home, color: '#FF9500' },
  { id: 'custom', name: 'Custom', icon: Plus, color: '#8e8e93' },
];

const presetColors = ['#007AFF', '#FF9500', '#5856D6', '#FF2D55', '#34C759', '#8e8e93'];

export default function AddTransactionScreen() {
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('');
  const [customCategoryImage, setCustomCategoryImage] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const { addTransaction, cards } = useFinanceStore();
  const [selectedCard, setSelectedCard] = useState<string>('');

  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0].id);
    }
  }, [cards, selectedCard]);

  const handleSelectPaymentMethod = () => {
    if (Platform.OS === 'ios') {
      const options = cards.map(c => c.number);
      options.push('Cancel');
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
        },
        buttonIndex => {
          if (buttonIndex < cards.length) {
            setSelectedCard(cards[buttonIndex].id);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Payment Method',
        '',
        cards.map(c => ({
          text: c.number,
          onPress: () => setSelectedCard(c.id),
        }))
      );
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'custom') {
      setShowCustomModal(true);
    }
  };

  const pickCustomCategoryImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access the gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setCustomCategoryImage(result.assets[0].uri);
    }
  };

  const handleAddTransaction = () => {
    if (!amount || !selectedCategory) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    let categoryName = '';
    let categoryColor = '';
    let categoryImage = '';
    if (selectedCategory === 'custom') {
      if (!customCategoryName.trim()) {
        Alert.alert('Error', 'Please enter a custom category name');
        return;
      }
      categoryName = customCategoryName.trim();
      categoryColor = customCategoryColor || '#8e8e93';
      categoryImage = customCategoryImage;
    } else {
      const categoryObj = defaultCategories.find(c => c.id === selectedCategory);
      categoryName = categoryObj ? categoryObj.name : 'Other';
      categoryColor = categoryObj ? categoryObj.color : '#8e8e93';
    }

    const paymentInfo = cards.find(c => c.id === selectedCard);
    const finalAmount =
      transactionType === 'expense'
        ? -Math.abs(numericAmount)
        : Math.abs(numericAmount);

    const transaction = {
      id: Date.now().toString(),
      amount: finalAmount,
      category: categoryName,
      note: note || 'No description',
      date: new Date().toISOString(),
      paymentMethod: paymentInfo ? paymentInfo.number : 'No Card',
      type: transactionType,
      customColor: selectedCategory === 'custom' ? categoryColor : undefined,
      customImage: selectedCategory === 'custom' ? categoryImage : undefined,
    };

    addTransaction(transaction);
    setAmount('');
    setNote('');
    setSelectedCategory(null);
    setCustomCategoryName('');
    setCustomCategoryColor('');
    setCustomCategoryImage('');
    setShowCustomModal(false);
    router.back();
  };

  const previewColor = customCategoryColor.trim() !== '' ? customCategoryColor.trim().toLowerCase() : '#ffffff';

  const renderPresetColors = () => (
    <View style={styles.presetColorsContainer}>
      {presetColors.map(preset => (
        <TouchableOpacity
          key={preset}
          style={[
            styles.colorSwatch,
            { backgroundColor: preset },
            preset === previewColor && styles.selectedSwatch,
          ]}
          onPress={() => setCustomCategoryColor(preset)}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Transaction</Text>
          </View>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                transactionType === 'expense' && styles.activeToggleButton,
              ]}
              onPress={() => setTransactionType('expense')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  transactionType === 'expense' && styles.activeToggleButtonText,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                transactionType === 'income' && styles.activeToggleButton,
              ]}
              onPress={() => setTransactionType('income')}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  transactionType === 'income' && styles.activeToggleButtonText,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#8e8e93"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoriesGrid}>
              {defaultCategories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryButton, selectedCategory === category.id && styles.selectedCategory]}
                  onPress={() => handleCategoryPress(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <category.icon size={24} color="white" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {selectedCategory === 'custom' && (
              <Text style={styles.hintText}>Tap below to enter custom details</Text>
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity style={styles.paymentMethod} onPress={handleSelectPaymentMethod}>
              <CreditCard size={24} color="#007AFF" />
              <Text style={styles.paymentText}>
                {cards.find(c => c.id === selectedCard)?.number || 'No Card'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note"
              placeholderTextColor="#8e8e93"
              multiline
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
          <Modal visible={showCustomModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Custom Category Details</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Category Name"
                  value={customCategoryName}
                  onChangeText={setCustomCategoryName}
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
                <TouchableOpacity style={styles.modalButton} onPress={pickCustomCategoryImage}>
                  <Text style={styles.modalButtonText}>
                    {customCategoryImage ? 'Change Image' : 'Pick Image'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowCustomModal(false);
                      setSelectedCategory(null);
                      setCustomCategoryName('');
                      setCustomCategoryColor('');
                      setCustomCategoryImage('');
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
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1c1c1e',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontFamily: 'Inter-Regular',
  },
  activeToggleButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginRight: 8,
    fontFamily: 'Inter-Bold',
  },
  amountInput: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1c1c1e',
    minWidth: 150,
    fontFamily: 'Inter-Bold',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 15,
    fontFamily: 'Inter-SemiBold',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
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
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#1c1c1e',
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  hintText: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 17,
    color: '#1c1c1e',
    fontFamily: 'Inter-Regular',
  },
  noteInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 17,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Inter-Regular',
  },
  addButton: {
    margin: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
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
  },
  presetColorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
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
