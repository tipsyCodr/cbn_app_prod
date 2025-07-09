import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { submitOneToOne, getMembers } from '@/utils/form-api'
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'

interface Member {
  id: number;
  name: string;
  company?: string;
}

const OneToOne = () => {
  // Member selection states
  const [selectedMetWithId, setSelectedMetWithId] = useState<number | null>(null);
  const [selectedMetWithName, setSelectedMetWithName] = useState('');
  const [showMetWithPicker, setShowMetWithPicker] = useState(false);
  
  // Form field states
  const [initiatedBy, setInitiatedBy] = useState<'myself' | 'other_person'>('myself');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [topics, setTopics] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // UI states
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load members when component mounts
  useEffect(() => {
    const loadMembers = async () => {
      setIsLoading(true);
      try {
        const result = await getMembers();
        if (result.success && result.data) {
          setMembers(result.data);
        } else {
          Alert.alert('Error', result.message || 'Failed to load members');
        }
      } catch (error) {
        console.error('Error loading members:', error);
        Alert.alert('Error', 'Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMembers();
  }, []);

  const handleSubmit = async () => {
    // Form validation
    if (!selectedMetWithId) {
      Alert.alert('Error', 'Please select who you met with');
      return;
    }
    
    if (!meetingLocation) {
      Alert.alert('Error', 'Please enter meeting location');
      return;
    }

    if (!topics) {
      Alert.alert('Error', 'Please enter topics discussed');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitOneToOne({
        met_with: selectedMetWithId.toString(),
        initiated_by: initiatedBy === 'myself' ? 'myself' : selectedMetWithName,
        meeting_location: meetingLocation,
        meeting_date: meetingDate,
        topics: topics
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'One-to-One Meeting Submitted',
          text2: 'Your meeting has been recorded',
          position: 'top',
          visibilityTime: 2000,
          onHide: () => router.back()
        });
      } else {
        Alert.alert('Submission Failed', result.message || 'Failed to submit meeting');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setMeetingDate(selectedDate);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#042117" />
        <Text style={styles.loadingText}>Loading members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#042117" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>One-to-One Meeting</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Met With Field */}
        <Text style={styles.label}>Met With:</Text>
        <TouchableOpacity
          onPress={() => setShowMetWithPicker(true)}
          style={styles.input}
        >
          <Text>{selectedMetWithName || 'Select Person'}</Text>
        </TouchableOpacity>

        <Modal
          visible={showMetWithPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    onPress={() => {
                      setSelectedMetWithId(member.id);
                      setSelectedMetWithName(member.name);
                      setShowMetWithPicker(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text>{member.name}{member.company ? ` - ${member.company}` : ''}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowMetWithPicker(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Initiated By */}
        <Text style={styles.label}>Initiated By:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              initiatedBy === 'myself' && styles.selectedButton
            ]}
            onPress={() => setInitiatedBy('myself')}
          >
            <Text style={[
              styles.buttonText,
              initiatedBy === 'myself' && styles.selectedButtonText
            ]}>Myself</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              initiatedBy === 'other_person' && styles.selectedButton
            ]}
            onPress={() => setInitiatedBy('other_person')}
          >
            <Text style={[
              styles.buttonText,
              initiatedBy === 'other_person' && styles.selectedButtonText
            ]}>Other Person</Text>
          </TouchableOpacity>
        </View>

        {/* Meeting Location */}
        <Text style={styles.label}>Meeting Location:</Text>
        <TextInput
          value={meetingLocation}
          onChangeText={setMeetingLocation}
          placeholder="Enter meeting location"
          style={styles.input}
        />

        {/* Meeting Date */}
        <Text style={styles.label}>Meeting Date:</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          <Text>{meetingDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={meetingDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        {/* Topics */}
        <Text style={styles.label}>Topics Discussed:</Text>
        <TextInput
          value={topics}
          onChangeText={setTopics}
          placeholder="Enter topics discussed"
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#042117',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#042117',
  },
  buttonText: {
    color: '#042117',
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    maxHeight: '80%', 
    width: '100%',
    overflow: 'hidden',
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalCancel: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  cancelText: {
    color: '#042117',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#042117',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    height: 50,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#f7a6b3',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    // maxHeight: '70%',
  },
  scrollContent: {
    padding: 15,
  },
});

export default OneToOne; 