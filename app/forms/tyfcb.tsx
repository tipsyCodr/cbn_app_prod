import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { submitTYFCB, getMembers } from '@/utils/form-api'
import Toast from 'react-native-toast-message'

interface Member {
  id: number;
  name: string;
  company?: string;
}

const TYFCB = () => {
  const [amount, setAmount] = useState('');
  const [selectedThankYouId, setSelectedThankYouId] = useState<number | null>(null);
  const [selectedThankYouName, setSelectedThankYouName] = useState('');
  const [showThankYouPicker, setShowThankYouPicker] = useState(false);
  const [businessType, setBusinessType] = useState<'New' | 'Repeat'>('New');
  const [referralType, setReferralType] = useState<'Inside' | 'Outside' | 'Tier3+'>('Inside');
  const [comment, setComment] = useState('');
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
    if (!selectedThankYouId) {
      Alert.alert('Error', 'Please select who to thank');
      return;
    }

    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitTYFCB({
        thankYouTo: selectedThankYouId,
        amount,
        businessType,
        referralType,
        comment
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Thank You For Business',
          text2: 'Your TYFCB has been submitted successfully',
          position: 'top',
          visibilityTime: 2000,
          onHide: () => router.back()
        });
      } else {
        Alert.alert('Submission Failed', result.message || 'Failed to submit TYFCB');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
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
      {/*/!* Header *!/*/}
      {/*<View style={styles.header}>*/}
      {/*  <TouchableOpacity*/}
      {/*    style={styles.backButton}*/}
      {/*    onPress={() => router.back()}*/}
      {/*  >*/}
      {/*    <Ionicons name="arrow-back" size={24} color="#042117" />*/}
      {/*  </TouchableOpacity>*/}
      {/*  <Text style={styles.headerTitle}>Thank You For Business</Text>*/}
      {/*  <View style={styles.headerRight} />*/}
      {/*</View>*/}

      <ScrollView style={styles.content}>
        {/* Thank You To Field */}
        <Text style={styles.label}>Thank You To:</Text>
        <TouchableOpacity
          onPress={() => setShowThankYouPicker(true)}
          style={styles.input}
        >
          <Text>{selectedThankYouName || 'Select Person'}</Text>
        </TouchableOpacity>

        <Modal
          visible={showThankYouPicker}
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
                      setSelectedThankYouId(member.id);
                      setSelectedThankYouName(member.name);
                      setShowThankYouPicker(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text>{member.name}{member.company ? ` - ${member.company}` : ''}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowThankYouPicker(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Amount Field */}
        <Text style={styles.label}>Amount:</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
          style={styles.input}
        />

        {/* Business Type Field */}
        <Text style={styles.label}>Business Type:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              businessType === 'New' && styles.selectedButton
            ]}
            onPress={() => setBusinessType('New')}
          >
            <Text style={[
              styles.buttonText,
              businessType === 'New' && styles.selectedButtonText
            ]}>New</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              businessType === 'Repeat' && styles.selectedButton
            ]}
            onPress={() => setBusinessType('Repeat')}
          >
            <Text style={[
              styles.buttonText,
              businessType === 'Repeat' && styles.selectedButtonText
            ]}>Repeat</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Type Field */}
        <Text style={styles.label}>Referral Type:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              referralType === 'Inside' && styles.selectedButton
            ]}
            onPress={() => setReferralType('Inside')}
          >
            <Text style={[
              styles.buttonText,
              referralType === 'Inside' && styles.selectedButtonText
            ]}>Inside</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              referralType === 'Outside' && styles.selectedButton
            ]}
            onPress={() => setReferralType('Outside')}
          >
            <Text style={[
              styles.buttonText,
              referralType === 'Outside' && styles.selectedButtonText
            ]}>Outside</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              referralType === 'Tier3+' && styles.selectedButton
            ]}
            onPress={() => setReferralType('Tier3+')}
          >
            <Text style={[
              styles.buttonText,
              referralType === 'Tier3+' && styles.selectedButtonText
            ]}>Tier 3+</Text>
          </TouchableOpacity>
        </View>

        {/* Comment Field */}
        <Text style={styles.label}>Comment:</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Enter comment"
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
    padding: 10,
  },
});

export default TYFCB; 