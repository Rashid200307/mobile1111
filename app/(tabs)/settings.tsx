// app/(tabs)/settings.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  Bell,
  Lock,
  CircleHelp as HelpCircle,
  ChevronRight,
  LogOut,
  Moon,
  Globe,
  UserCircle,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { shallow } from 'zustand/shallow';
import { useProfileStore } from '../../st/store'; // Adjust path as necessary
import { useFinanceStore } from '@/lib/store'; // Adjust path as necessary
import * as googleDriveService from '@/lib/googleDriveService'; // Adjust path as necessary

function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);

  // Get profile data from the global profile store.
  const { fullName, email, profileImage } = useProfileStore(
    (s) => ({
      fullName: s.fullName,
      email: s.email,
      profileImage: s.profileImage,
    }),
    shallow
  );

  // Get finance data and setters for backup/restore functionality.
  const { transactions, cards, setTransactions, setCards } = useFinanceStore();

  // Use dynamic styles based on dark mode.
  const styles = createStyles(darkMode);

  // Handler for logging out.
  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => Alert.alert('Success', 'You have been logged out'),
      },
    ]);

  // Handler for changing language.
  const handleLanguageChange = () =>
    Alert.alert('Change Language', 'Select your preferred language', [
      { text: 'English', onPress: () => console.log('English selected') },
      { text: 'Spanish', onPress: () => console.log('Spanish selected') },
      { text: 'French', onPress: () => console.log('French selected') },
      { text: 'Cancel', style: 'cancel' },
    ]);

  // Handler for navigating to the profile screen.
  const handleProfilePress = () => router.push('/profile');

  // --- Change Password Modal Handlers ---
  const openPwdModal = () => setPwdModalVisible(true);
  const closePwdModal = () => {
    setPwdModalVisible(false);
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };
  const handleChangePassword = () => {
    if (!currentPwd || !newPwd || newPwd !== confirmPwd) {
      return Alert.alert('Error', 'Fill all fields and ensure new passwords match.');
    }
    // TODO: call your API for changing the password
    Alert.alert('Success', 'Password updated.');
    closePwdModal();
  };

  // --- Backup & Restore Handlers ---
  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const dataToBackup = { transactions, cards };
      const accessToken = await googleDriveService.signInWithGoogle();
      await googleDriveService.backupDataToGoogleDrive(accessToken, dataToBackup);
      Alert.alert('Backup Successful', 'Your data has been backed up to Google Drive.');
    } catch (error: any) {
      Alert.alert('Backup Failed', error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    setBackupLoading(true);
    try {
      const accessToken = await googleDriveService.signInWithGoogle();
      const backupData = await googleDriveService.restoreDataFromGoogleDrive(accessToken);
      if (backupData.transactions && backupData.cards) {
        setTransactions(backupData.transactions);
        setCards(backupData.cards);
        Alert.alert('Restore Successful', 'Your data has been restored from Google Drive.');
      } else {
        Alert.alert('Restore Failed', 'The backup data is incomplete.');
      }
    } catch (error: any) {
      Alert.alert('Restore Failed', error.message);
    } finally {
      setBackupLoading(false);
    }
  };

  // Handler for navigating to Help & Support page.
  const handleHelpSupport = () => router.push('/helpSupport');

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <TouchableOpacity style={styles.profileSection} onPress={handleProfilePress}>
          <View style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <UserCircle size={60} color={darkMode ? '#0A84FF' : '#007AFF'} />
              )}
            </View>
            <View>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#8e8e93" />
        </TouchableOpacity>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#0A84FF' : '#007AFF' }]}>
                <Bell size={20} color="white" />
              </View>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: darkMode ? '#3A3A3C' : '#e5e5ea', true: '#34c759' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: darkMode ? '#5E5CE6' : '#5856D6' }]}>
                <Moon size={20} color="white" />
              </View>
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: darkMode ? '#3A3A3C' : '#e5e5ea', true: '#34c759' }}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#FF2D55" }]}>
                <Globe size={20} color="white" />
              </View>
              <Text style={styles.settingText}>Language</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.settingValue}>English</Text>
              <ChevronRight size={20} color="#8e8e93" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity style={styles.settingItem} onPress={openPwdModal}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#32C759' }]}>
                <Lock size={20} color="white" />
              </View>
              <Text style={styles.settingText}>Change Password</Text>
            </View>
            <ChevronRight size={20} color="#8e8e93" />
          </TouchableOpacity>
        </View>

        {/* Backup & Restore Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Restore</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleBackup}>
            <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
              <UploadCloud size={20} color="white" />
            </View>
            <Text style={styles.settingText}>Backup to Google Drive</Text>
            <ChevronRight size={20} color="#8e8e93" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleRestore}>
            <View style={[styles.iconContainer, { backgroundColor: '#34c759' }]}>
              <DownloadCloud size={20} color="white" />
            </View>
            <Text style={styles.settingText}>Restore from Google Drive</Text>
            <ChevronRight size={20} color="#8e8e93" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/helpSupport')}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#64D2FF' }]}>
                <HelpCircle size={20} color="white" />
              </View>
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color="#8e8e93" />
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal visible={pwdModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={modalStyles.container}
        >
          <View style={modalStyles.content}>
            <Text style={modalStyles.title}>Change Password</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Current Password"
              placeholderTextColor="#8e8e93"
              secureTextEntry
              value={currentPwd}
              onChangeText={setCurrentPwd}
            />
            <TextInput
              style={modalStyles.input}
              placeholder="New Password"
              placeholderTextColor="#8e8e93"
              secureTextEntry
              value={newPwd}
              onChangeText={setNewPwd}
            />
            <TextInput
              style={modalStyles.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#8e8e93"
              secureTextEntry
              value={confirmPwd}
              onChangeText={setConfirmPwd}
            />
            <View style={modalStyles.buttons}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => {
                  setPwdModalVisible(false);
                  setCurrentPwd('');
                  setNewPwd('');
                  setConfirmPwd('');
                }}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleChangePassword}>
                <Text style={modalStyles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

function createStyles(darkMode: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: darkMode ? '#1c1c1e' : '#f8f9fa' },
    contentContainer: { paddingBottom: 40 },
    header: { padding: 20, paddingTop: 60 },
    title: { fontSize: 28, fontFamily: 'Inter-Bold', color: darkMode ? '#f8f9fa' : '#1c1c1e' },
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: darkMode ? '#2c2c2e' : 'white',
      padding: 20,
      marginBottom: 20,
    },
    profileInfo: { flexDirection: 'row', alignItems: 'center' },
    profileImageContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      overflow: 'hidden',
      marginRight: 15,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileName: { fontSize: 20, fontFamily: 'Inter-SemiBold', color: darkMode ? '#f8f9fa' : '#1c1c1e', marginBottom: 4 },
    profileEmail: { fontSize: 14, fontFamily: 'Inter-Regular', color: darkMode ? '#8e8e93' : '#8e8e93' },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 17, fontFamily: 'Inter-SemiBold', color: darkMode ? '#8e8e93' : '#8e8e93', marginLeft: 20, marginBottom: 8 },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: darkMode ? '#2c2c2e' : 'white',
      padding: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: darkMode ? '#3a3a3c' : '#c6c6c8',
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    settingText: { fontSize: 17, fontFamily: 'Inter-Regular', color: darkMode ? '#f8f9fa' : '#1c1c1e' },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    settingValue: { fontSize: 17, fontFamily: 'Inter-Regular', color: darkMode ? '#8e8e93' : '#8e8e93', marginRight: 8 },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      backgroundColor: darkMode ? '#2c2c2e' : 'white',
      marginTop: 20,
      marginBottom: 40,
    },
    logoutText: { color: '#FF3B30', fontSize: 17, fontFamily: 'Inter-SemiBold', marginLeft: 8 },
  });
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  content: { backgroundColor: 'white', margin: 20, borderRadius: 8, padding: 20 },
  title: { fontSize: 20, fontFamily: 'Inter-Bold', marginBottom: 15 },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { padding: 10, marginRight: 10 },
  cancelText: { fontFamily: 'Inter-SemiBold', color: '#8e8e93' },
  saveBtn: { padding: 10, backgroundColor: '#007AFF', borderRadius: 6 },
  saveText: { color: 'white', fontFamily: 'Inter-SemiBold' },
});

export default SettingsScreen;
