// app/(tabs)/cards.tsx
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFinanceStore } from '@/lib/store';

export default function CardsScreen() {
  const { cards } = useFinanceStore();
  const router = useRouter();

  const handleAddCard = () => {
    // Navigate to card form in add mode (no id)
    router.push({ pathname: 'cardForm' } as any);
  };

  const handleEditCard = (cardId: string) => {
    // Navigate to card form with the card's id for editing
    router.push({ pathname: 'cardForm', params: { id: cardId } } as any);
  };

  const renderCard = ({ item }: { item: any }) => {
    if (item.image) {
      // If image exists, display it as the full background.
      return (
        <TouchableOpacity onPress={() => handleEditCard(item.id)} style={styles.cardWrapper}>
          <View style={[styles.cardContainer, styles.cardContainerImage]}>
            <Image source={{ uri: item.image }} style={styles.cardImageFull} />
            <View style={styles.cardDetails}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{item.type}</Text>
                <Text style={styles.cardNumber}>{item.number}</Text>
              </View>
              <Text style={styles.cardBalance}>${item.balance.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // If no image, use gradient based on card color.
      const gradientColors: [string, string] = [
        item.color || '#4c669f',
        item.color ? lightenColor(item.color, 20) : '#3b5998'
      ];
      return (
        <TouchableOpacity onPress={() => handleEditCard(item.id)} style={styles.cardWrapper}>
          <LinearGradient 
            colors={gradientColors} 
            style={styles.cardContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardDetails}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{item.type}</Text>
                <Text style={styles.cardNumber}>{item.number}</Text>
              </View>
              <Text style={styles.cardBalance}>${item.balance.toFixed(2)}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cards</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      {cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No cards available. Tap "+" to add one.</Text>
        </View>
      ) : (
        <FlatList 
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

/**
 * Lightens a hex color by the given percent.
 */
const lightenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1c1c1e',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
    fontFamily: 'Inter-Regular',
  },
  listContent: {
    padding: 20,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  // Additional style when image is present
  cardContainerImage: {
    backgroundColor: '#000',
  },
  cardImageFull: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardType: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  cardNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
  },
  cardBalance: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  cardImagePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  placeholderText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
});
