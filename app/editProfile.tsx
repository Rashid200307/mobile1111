// app/(tabs)/editProfile.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '../st/store';

export default function EditProfileScreen() {
  const router = useRouter();
  const { fullName, email, phone, profileImage, setProfile } = useProfileStore();

  // Local state for editing profile fields.
  const [newFullName, setNewFullName] = useState(fullName);
  const [newEmail, setNewEmail] = useState(email);
  const [newPhone, setNewPhone] = useState(phone);
  const [newProfileImage, setNewProfileImage] = useState(profileImage);

  // Request permission to access the media library.
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Permission to access the media library is required!'
        );
      }
    })();
  }, []);

  // Function to pick an image from the device.
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only images
        allowsEditing: true, // Enable basic cropping
        aspect: [1, 1],      // Force a square crop
        quality: 1,
      });
      console.log('ImagePicker result:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Set the new profile image URI.
        setNewProfileImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
    }
  };

  const handleSave = () => {
    // Basic validation.
    if (!newFullName.trim() || !newEmail.trim()) {
      Alert.alert('Error', 'Full name and email are required.');
      return;
    }
    // Update the global store with the new profile details.
    setProfile({
      fullName: newFullName,
      email: newEmail,
      phone: newPhone,
      profileImage: newProfileImage,
    });
    Alert.alert('Success', 'Profile updated successfully.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Chevron */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.header}>Edit Profile</Text>

        {/* Profile Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {newProfileImage ? (
            <Image source={{ uri: newProfileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Select Image</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Full Name Input */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={newFullName}
          onChangeText={setNewFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#888"
        />

        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Enter your email"
          placeholderTextColor="#888"
        />

        {/* Phone Input */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={newPhone}
          onChangeText={setNewPhone}
          keyboardType="phone-pad"
          placeholder="Enter your phone number"
          placeholderTextColor="#888"
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e5e5ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: 'white',
    color: '#1c1c1e', // Ensure text is visible
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
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
});

export { };
