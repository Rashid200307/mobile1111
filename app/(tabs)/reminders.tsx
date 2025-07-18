// app/(tabs)/reminders.tsx
import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

interface Reminder {
  id: string;
  date: string; // in YYYY-MM-DD format
  note: string;
  amount: number; // financial amount
  priority: 'low' | 'medium' | 'high';
  isRecurring?: boolean;
}

type ViewMode = 'notebook';

// Helper function: returns a style object for the priority indicator.
const getPriorityIndicatorStyle = (priority: 'low' | 'medium' | 'high'): ViewStyle => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor:
    priority === 'low'
      ? '#4caf50'
      : priority === 'medium'
      ? '#ff9800'
      : '#f44336',
  marginRight: 10,
});

// Memoized NotebookItem component.
interface NotebookItemProps {
  item: Reminder;
  onPress: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}

const NotebookItem = memo(({ item, onPress, onDelete }: NotebookItemProps) => (
  <TouchableOpacity style={styles.notebookItem} onPress={() => onPress(item)}>
    <View style={getPriorityIndicatorStyle(item.priority)} />
    <View style={styles.itemTextContainer}>
      <Text style={styles.notebookNote} numberOfLines={1}>
        {item.note}
      </Text>
      <Text style={styles.notebookDate}>
        {format(new Date(item.date), 'MMM dd, yyyy')}
      </Text>
      <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
    </View>
    <TouchableOpacity onPress={() => onDelete(item.id)}>
      <Feather name="trash-2" size={20} color="#ff3b30" />
    </TouchableOpacity>
  </TouchableOpacity>
));

export default function RemindersScreen() {
  const router = useRouter();

  // Local state (can later be lifted into a global store)
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd')); // For filtering
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for adding/editing reminders.
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [amountInput, setAmountInput] = useState(''); // as string
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Date filter picker state.
  const [showFilterDatePicker, setShowFilterDatePicker] = useState(false);

  // Debounced search query.
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Group reminders by date.
  const notebookItems = useMemo(() => {
    const data: { [date: string]: Reminder[] } = {};
    reminders.forEach((reminder) => {
      if (!data[reminder.date]) {
        data[reminder.date] = [];
      }
      data[reminder.date].push(reminder);
    });
    return data;
  }, [reminders]);

  // Date picker handlers.
  const onReminderDateChange = useCallback((event: any, selected?: Date) => {
    if (selected) {
      setReminderDate(format(selected, 'yyyy-MM-dd'));
    }
    setShowDatePicker(false);
  }, []);

  const onFilterDateChange = useCallback((event: any, selected?: Date) => {
    if (selected) {
      setSelectedDate(format(selected, 'yyyy-MM-dd'));
    }
    setShowFilterDatePicker(false);
  }, []);

  // Open modal for a new reminder.
  const openNewReminderModal = () => {
    setCurrentReminder(null);
    setNoteInput('');
    setAmountInput('');
    setPriority('medium');
    setIsRecurring(false);
    setReminderDate(format(new Date(), 'yyyy-MM-dd'));
    setModalVisible(true);
  };

  // Open modal for editing a reminder.
  const openEditReminderModal = (reminder: Reminder) => {
    setCurrentReminder(reminder);
    setNoteInput(reminder.note);
    setAmountInput(reminder.amount.toString());
    setPriority(reminder.priority);
    setIsRecurring(!!reminder.isRecurring);
    setReminderDate(reminder.date);
    setModalVisible(true);
  };

  // Save reminder handler.
  const handleSaveReminder = useCallback(() => {
    if (!noteInput.trim()) {
      Alert.alert('Error', 'Please enter a reminder note.');
      return;
    }
    const amount = parseFloat(amountInput);
    if (isNaN(amount)) {
      Alert.alert('Error', 'Please enter a valid financial amount.');
      return;
    }
    if (currentReminder) {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === currentReminder.id
            ? { ...r, note: noteInput, amount, priority, isRecurring, date: reminderDate }
            : r
        )
      );
      Alert.alert('Success', 'Reminder updated successfully.');
    } else {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        date: reminderDate,
        note: noteInput,
        amount,
        priority,
        isRecurring,
      };
      setReminders((prev) => [...prev, newReminder]);
      Alert.alert('Success', 'Reminder added successfully.');
    }
    setModalVisible(false);
  }, [currentReminder, noteInput, amountInput, reminderDate, priority, isRecurring]);

  // Delete reminder handler.
  const handleDeleteReminder = useCallback((id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setReminders((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  }, []);

  // Render a date filter button.
  const renderDateFilter = () => (
    <TouchableOpacity style={styles.dateFilterButton} onPress={() => setShowFilterDatePicker(true)}>
      <Text style={styles.dateFilterText}>Filter by Date: {selectedDate}</Text>
    </TouchableOpacity>
  );

  // Render a simple segmented control (here fixed to "Notebook").
  const renderSegmentedControl = () => (
    <View style={styles.segmentedControl}>
      <Text style={[styles.segmentButtonText, styles.segmentButtonTextActive]}>
        Notebook
      </Text>
    </View>
  );

  // Filter reminders based on the debounced search query.
  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) =>
      reminder.note.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [reminders, debouncedSearch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.screenTitle}>Financial Reminders</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search reminders..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {renderSegmentedControl()}
          {renderDateFilter()}
          {showFilterDatePicker && (
            <DateTimePicker
              value={new Date(selectedDate)}
              mode="date"
              display="default"
              onChange={onFilterDateChange}
            />
          )}
          <TouchableOpacity style={styles.addButton} onPress={openNewReminderModal}>
            <Text style={styles.addButtonText}>+ Add Reminder</Text>
          </TouchableOpacity>
          <FlatList
            data={notebookItems[selectedDate] || []}
            keyExtractor={(item: Reminder) => item.id}
            renderItem={({ item }) => (
              <NotebookItem item={item} onPress={openEditReminderModal} onDelete={handleDeleteReminder} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyData}>
                <Text style={styles.emptyDataText}>No reminders for this day.</Text>
              </View>
            }
            contentContainerStyle={styles.notebookList}
            removeClippedSubviews
            initialNumToRender={10}
            windowSize={5}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Modal for Adding/Editing a Reminder */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentReminder ? 'Edit Reminder' : 'Add Reminder'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter reminder note"
              placeholderTextColor="#666"
              value={noteInput}
              onChangeText={setNoteInput}
            />
            {/* Date Selector */}
            <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateSelectorText}>Select Date: {reminderDate}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(reminderDate)}
                mode="date"
                display="default"
                onChange={onReminderDateChange}
              />
            )}
            {/* Financial Amount Input */}
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Amount (e.g., 99.99)"
              placeholderTextColor="#666"
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="numeric"
            />
            {/* Priority Selector */}
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority:</Text>
              <TouchableOpacity style={[styles.priorityButton, priority === 'low' && styles.priorityButtonActive]} onPress={() => setPriority('low')}>
                <Text style={styles.priorityButtonText}>Low</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.priorityButton, priority === 'medium' && styles.priorityButtonActive]} onPress={() => setPriority('medium')}>
                <Text style={styles.priorityButtonText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.priorityButton, priority === 'high' && styles.priorityButtonActive]} onPress={() => setPriority('high')}>
                <Text style={styles.priorityButtonText}>High</Text>
              </TouchableOpacity>
            </View>
            {/* Recurring Toggle */}
            <View style={styles.recurringContainer}>
              <Text style={styles.recurringLabel}>Recurring:</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: '#ccc', true: '#007AFF' }}
                thumbColor={isRecurring ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNoteInput('');
                  setAmountInput('');
                  setPriority('medium');
                  setIsRecurring(false);
                  setCurrentReminder(null);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleSaveReminder}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  screenTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  searchContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 5,
  },
  segmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  segmentButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  segmentButtonTextActive: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  fixedAddButton: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 80, // Positioned to be visible above navigation tabs.
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  fixedAddButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  dateFilterButton: {
    backgroundColor: '#e5e5e5',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  dateFilterText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  emptyData: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyDataText: {
    fontSize: 16,
    color: '#888',
  },
  // Notebook list styles.
  notebookList: {
    paddingVertical: 10,
  },
  notebookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  itemTextContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  notebookNote: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  notebookDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  amountText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#007AFF',
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  // Modal styles.
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginBottom: 15,
  },
  dateSelector: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    marginBottom: 15,
  },
  dateSelectorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  priorityLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
    marginRight: 10,
  },
  priorityButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 5,
  },
  priorityButtonActive: {
    backgroundColor: '#007AFF',
  },
  priorityButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  recurringLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
});

export { };
