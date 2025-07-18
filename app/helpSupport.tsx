// app/(tabs)/helpSupport.tsx
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HelpSupportScreen() {
  const router = useRouter();

  // Navigate back
  const handleBack = () => router.back();

  // Navigate to Cards screen
  const goToCards = () => router.push('/cards');

  // Navigate to About screen (make sure you have an About.tsx)
  const goToAbout = () => router.push('/about');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.header}>Help & Support</Text>

        {/* Introduction */}
        <Text style={styles.intro}>
          Welcome to our Help & Support page. If you have any questions or need assistance, please check our FAQs or contact our support team.
        </Text>

        {/* FAQs Section */}
        <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>

        {/* Existing FAQs */}
        <View style={styles.faqItem}>
          <Text style={styles.question}>Q: How do I reset my password?</Text>
          <Text style={styles.answer}>
            A: To reset your password, go to Settings and select "Change Password". Follow the instructions provided.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>Q: How can I backup my data?</Text>
          <Text style={styles.answer}>
            A: You can backup your data to Google Drive from the Backup & Restore section in Settings.
          </Text>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>Q: How do I contact support?</Text>
          <Text style={styles.answer}>
            A: For further assistance, please email support@example.com or call +1 123 456 7890.
          </Text>
        </View>

        {/* New FAQs */}
        <View style={styles.faqItem}>
          <Text style={styles.question}>Q: How do I manage my cards?</Text>
          <TouchableOpacity onPress={goToCards}>
            <Text style={[styles.answer, styles.link]}>
              A: Tap here to go to your Cards screen.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.faqItem}>
          <Text style={styles.question}>Q: Where can I learn more about this app?</Text>
          <TouchableOpacity onPress={goToAbout}>
            <Text style={[styles.answer, styles.link]}>
              A: Tap here to view our About page.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for using our app!
        </Text>
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
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  header: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
    marginBottom: 20,
    textAlign: 'center',
  },
  intro: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
    marginBottom: 20,
    lineHeight: 24,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1c1c1e',
    marginBottom: 10,
  },
  faqItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  question: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1c1c1e',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginTop: 4,
  },
  footer: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8e8e93',
    marginTop: 20,
    textAlign: 'center',
  },
});
