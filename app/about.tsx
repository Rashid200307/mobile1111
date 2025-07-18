// app/(tabs)/about.tsx
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  const handleBack = () => router.back();
  const openLink = (url: string) => Linking.openURL(url).catch(() => alert('Cannot open link'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.header}>About Finance Tracker</Text>

        {/* Description */}
        <Text style={styles.paragraph}>
          Finance Tracker helps you manage your money effortlessly. Track expenses & income, visualize your spending, and keep your data safe.
        </Text>

        {/* Tabs Overview */}
        <Text style={styles.sectionHeader}>App Sections</Text>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>🏠 Home</Text>
          <Text style={styles.tabDesc}>
            Your dashboard: total balance, quick overview of this month’s expenses & income, plus recent transactions.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>💳 Cards</Text>
          <Text style={styles.tabDesc}>
            View and manage your payment cards. Tap “+” to add a new card or select one to edit its details.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>➕ Add</Text>
          <Text style={styles.tabDesc}>
            Quickly add a new transaction—expense or income—select category, amount, date, and card.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>📊 Analytics</Text>
          <Text style={styles.tabDesc}>
            Visualize your spending by category and month. See pie charts and bar charts for deeper insights.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>📈 Summary</Text>
          <Text style={styles.tabDesc}>
            A detailed, filterable table of transactions over custom periods. Search, sort, and export to Excel.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>🕒 History</Text>
          <Text style={styles.tabDesc}>
            Swipe through your transaction history by month. Delete or edit past entries as needed.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>⚙️ Settings</Text>
          <Text style={styles.tabDesc}>
            Manage your profile, app preferences (notifications, dark mode, language), change password, and backup/restore data.
          </Text>
        </View>

        <View style={styles.tabItem}>
          <Text style={styles.tabTitle}>⏰ Reminders</Text>
          <Text style={styles.tabDesc}>
            Schedule financial reminders with notes, amounts, and priorities. Get notified so you never miss a payment.
          </Text>
        </View>

        {/* Version & Developer */}
        <Text style={styles.sectionHeader}>App Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Developer</Text>
          <Text style={styles.value}>Mohammed Rashid</Text>
        </View>

        {/* Links */}
        <Text style={styles.sectionHeader}>Legal</Text>
        <TouchableOpacity onPress={() => openLink('https://example.com/privacy')}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://example.com/terms')}>
          <Text style={styles.link}>Terms of Service</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Mohammed Rashid. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { padding: 20, paddingBottom: 40 },
  backButton: { marginBottom: 20 },
  header: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
    marginBottom: 10,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1c1c1e',
    marginTop: 20,
    marginBottom: 10,
  },
  tabItem: { marginBottom: 15 },
  tabTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  tabDesc: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1c1c1e',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
  },
  link: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
  footer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
    marginTop: 30,
    textAlign: 'center',
  },
});
