// app/(tabs)/cardForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useFinanceStore } from '@/lib/store';

const presetColors = ['#007aff', '#ff9500', '#5856d6', '#ff2d55', '#34c759', '#8e8e93'];

export default function CardFormScreen() {
  // If an id is provided, we're editing an existing card.
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const router = useRouter();

  // Retrieve the card if in edit mode; otherwise, use empty fields.
  const card = useFinanceStore(state => state.cards.find(c => c.id === id));
  const addCard = useFinanceStore(state => state.addCard);
  const updateCard = useFinanceStore(state => state.updateCard);
  const removeCard = useFinanceStore(state => state.removeCard);

  const [cardType, setCardType] = useState(isEditMode ? card?.type || '' : '');
  const [cardNumber, setCardNumber] = useState(isEditMode ? card?.number || '' : '');
  const [balance, setBalance] = useState(isEditMode && card ? card.balance.toString() : '');
  const [color, setColor] = useState(isEditMode ? card?.color || '' : '');
  const [image, setImage] = useState(isEditMode ? card?.image || '' : '');

  // For preview, always use the lowercased trimmed value.
  const previewColor = color.trim() !== '' ? color.trim().toLowerCase() : '#ffffff';

  useEffect(() => {
    if (isEditMode && !card) {
      Alert.alert('Error', 'Card not found');
      router.back();
    }
  }, [card, isEditMode, router]);

  const handleSubmit = () => {
    if (!cardType || !cardNumber || isNaN(parseFloat(balance))) {
      Alert.alert('Error', 'Please fill in all required fields correctly.');
      return;
    }
    if (isEditMode) {
      updateCard(card!.id, {
        type: cardType,
        number: cardNumber,
        balance: parseFloat(balance),
        color: previewColor,
        image,
      });
      Alert.alert('Success', 'Card details updated successfully.');
    } else {
      const newCard = {
        id: Date.now().toString(),
        type: cardType,
        number: cardNumber,
        balance: parseFloat(balance),
        color: previewColor,
        image,
      };
      addCard(newCard);
      Alert.alert('Success', 'New card added successfully.');
    }
    router.back();
  };

  const handleRemove = () => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            removeCard(card!.id);
            Alert.alert('Success', 'Card removed successfully.');
            router.back();
          }
        }
      ]
    );
  };

  const pickImage = async () => {
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
      setImage(result.assets[0].uri);
    }
  };

  // Render preset color buttons.
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
          onPress={() => setColor(preset)}
        />
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isEditMode ? 'Edit Card' : 'Add New Card'}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Card Type (e.g., Visa)"
        placeholderTextColor="#666"
        value={cardType}
        onChangeText={setCardType}
      />
      <TextInput
        style={styles.input}
        placeholder="Card Number (e.g., 1234567812345678)"
        placeholderTextColor="#666"
        value={cardNumber}
        onChangeText={setCardNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Balance"
        placeholderTextColor="#666"
        value={balance}
        keyboardType="numeric"
        onChangeText={setBalance}
      />
      <TextInput
        style={[styles.input, styles.colorInput]}
        placeholder="Color (name or hex code)"
        placeholderTextColor="#666"
        value={color}
        onChangeText={text => setColor(text.toLowerCase())}
      />
      {/* Render preset color selection */}
      {renderPresetColors()}
      {/* Color Preview */}
      <View style={[styles.colorPreview, { backgroundColor: previewColor }]}>
        <Text style={styles.colorPreviewText}>Color Preview</Text>
      </View>
      <View style={styles.imagePickerContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.noImageText}>No image selected</Text>
        )}
        <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
          <Text style={styles.pickImageButtonText}>Choose Image</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {isEditMode ? 'Update Card' : 'Add Card'}
        </Text>
      </TouchableOpacity>
      {isEditMode && (
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
          <Text style={styles.removeButtonText}>Remove Card</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1c1c1e',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  colorInput: {
    borderColor: '#ccc',
    borderWidth: 1,
  },
  presetColorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
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
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePreview: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  noImageText: {
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
    marginBottom: 10,
  },
  pickImageButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  pickImageButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
});

export { };
