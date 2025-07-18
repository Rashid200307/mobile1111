// app/(tabs)/backup.tsx
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useFinanceStore } from '@/lib/store';
import * as googleDriveService from '@/lib/googleDriveService';

export default function BackupScreen() {
  const { transactions, cards, setTransactions, setCards } = useFinanceStore();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const dataToBackup = { transactions, cards };
      const accessToken = await googleDriveService.signInWithGoogle();
      await googleDriveService.backupDataToGoogleDrive(accessToken, dataToBackup);
      Alert.alert('Backup Successful', 'Your data has been backed up to Google Drive.');
    } catch (error: any) {
      Alert.alert('Backup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup & Restore</Text>
      <Button
        title={loading ? 'Please wait...' : 'Backup to Google Drive'}
        onPress={handleBackup}
        disabled={loading}
      />
      <View style={styles.spacer} />
      <Button
        title={loading ? 'Please wait...' : 'Restore from Google Drive'}
        onPress={handleRestore}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    color: '#1c1c1e',
  },
  spacer: {
    height: 20,
  },
});
