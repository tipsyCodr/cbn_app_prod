import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { submitReferral, getMembers } from '@/utils/form-api'
import Toast from 'react-native-toast-message'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Contacts from 'expo-contacts'

interface Member {
  id: number;
  name: string;
  company?: string;
}

interface ReferralData {
  to: string;
  referral_type: 'inside' | 'outside';
  referral_status: 'told_them_you_would_call' | 'given_card';
  referral_contact_name: string;
  referral_contact_email: string;
  referral_contact_no: string;
  mobile: string;
  address: string;
  comments: string;
  referral_hotness: string;
}

const Referral = () => {
  // Member selection states
  const [selectedToId, setSelectedToId] = useState<number | null>(null);
  const [selectedToName, setSelectedToName] = useState('');
  const [showToPicker, setShowToPicker] = useState(false);
  
  // Form field states
  const [referralType, setReferralType] = useState<'inside' | 'outside'>('outside');
  const [referralStatus, setReferralStatus] = useState<'told_them_you_would_call' | 'given_card'>('given_card');
  const [referralContactName, setReferralContactName] = useState('');
  const [referralContactNo, setReferralContactNo] = useState('');
  const [referralContactEmail, setReferralContactEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [referralHotness, setReferralHotness] = useState<number>(3);
  
  // UI states
  const [members, setMembers] = useState<Member[]>([]);
  const [deviceContacts, setDeviceContacts] = useState<Contacts.Contact[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
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

  // Function to request permission and open contact picker
  const pickContact = async () => {
    try {
      setIsLoadingContacts(true);
      
      // Request permission to access contacts
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        // Get all contacts
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
          sort: Contacts.SortTypes.FirstName,
        });

        // Filter out contacts without phone numbers
        const contactsWithPhoneNumbers = data.filter(contact => 
          contact.phoneNumbers && contact.phoneNumbers.length > 0
        );

        setDeviceContacts(contactsWithPhoneNumbers);
        
        if (contactsWithPhoneNumbers.length > 0) {
          setShowContactPicker(true);
        } else {
          Alert.alert('No Contacts', 'No contacts with phone numbers found on device');
        }
      } else {
        Alert.alert('Permission Denied', 'Permission to access contacts was denied');
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Function to select a contact from the modal
  const selectContact = (contact: Contacts.Contact) => {
    if (contact.name) {
      setReferralContactName(contact.name);
    }
    
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0 && contact.phoneNumbers[0].number) {
      setReferralContactNo(contact.phoneNumbers[0].number || '');
    }
    
    if (contact.emails && contact.emails.length > 0 && contact.emails[0].email) {
      setReferralContactEmail(contact.emails[0].email || '');
    }
    
    setShowContactPicker(false);
  };

  const handleSubmit = async () => {
    // Form validation
    if (!selectedToId) {
      Alert.alert('Error', 'Please select who the referral is to');
      return;
    }
    
    if (!referralContactName || !referralContactNo) {
      Alert.alert('Error', 'Please enter contact name and phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a properly formatted referral data object for the API
      const referralData: ReferralData = {
        to: selectedToId.toString(),
        referral_type: referralType,
        referral_status: referralStatus,
        referral_contact_name: referralContactName,
        referral_contact_email: referralContactEmail || '',
        referral_contact_no: referralContactNo,
        mobile: referralContactNo, // Use the contact phone number as the mobile field
        address: address || '',
        comments: comments || '',
        referral_hotness: referralHotness.toString()
      };

      console.log('Submitting referral:', referralData);
      const result = await submitReferral(referralData);
      console.log('Referral submission result:', result);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Referral Submitted',
          text2: 'Your referral has been recorded',
          position: 'top',
          visibilityTime: 2000,
          onHide: () => router.back()
        });
      } else {
        Alert.alert('Submission Failed', result.message || 'Failed to submit referral');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hotLevelColors = [
    '#FFD700', // Yellow
    '#FFA500', // Orange
    '#FF6347', // Tomato
    '#FF4500', // OrangeRed
    '#FF0000'  // Red
  ];

  const HotLevelButton = ({ level, selected, onPress }: { level: number, selected: boolean, onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.hotLevelButton, { backgroundColor: hotLevelColors[level - 1] }]}
    >
      {selected && <View style={styles.hotLevelSelected} />}
    </TouchableOpacity>
  );

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
      {/*<View style={styles.header}>*/}
      {/*  <TouchableOpacity*/}
      {/*    style={styles.backButton}*/}
      {/*    onPress={() => router.back()}*/}
      {/*  >*/}
      {/*    <Ionicons name="arrow-back" size={24} color="#042117" />*/}
      {/*  </TouchableOpacity>*/}
      {/*  <Text style={styles.headerTitle}>Referral Form</Text>*/}
      {/*  <View style={styles.headerRight} />*/}
      {/*</View>*/}

      <ScrollView style={styles.content}>
        {/* To Field */}
        <Text style={styles.label}>To:</Text>
        <TouchableOpacity
          onPress={() => setShowToPicker(true)}
          style={styles.input}
        >
          <Text>{selectedToName || 'Select Person'}</Text>
        </TouchableOpacity>

        <Modal
          visible={showToPicker}
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
                      setSelectedToId(member.id);
                      setSelectedToName(member.name);
                      setShowToPicker(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text>{member.name}{member.company ? ` - ${member.company}` : ''}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowToPicker(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Referral Type */}
        <Text style={styles.label}>Referral Type:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              referralType === 'outside' && styles.selectedButton
            ]}
            onPress={() => setReferralType('outside')}
          >
            <Text style={[
              styles.buttonText,
              referralType === 'outside' && styles.selectedButtonText
            ]}>Outside</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              referralType === 'inside' && styles.selectedButton
            ]}
            onPress={() => setReferralType('inside')}
          >
            <Text style={[
              styles.buttonText,
              referralType === 'inside' && styles.selectedButtonText
            ]}>Inside</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Status */}
        <Text style={styles.label}>Referral Status:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.button,
              referralStatus === 'told_them_you_would_call' && styles.selectedButton
            ]}
            onPress={() => setReferralStatus('told_them_you_would_call')}
          >
            <Text style={[
              styles.buttonText,
              referralStatus === 'told_them_you_would_call' && styles.selectedButtonText
            ]}>Told Them You Would Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              referralStatus === 'given_card' && styles.selectedButton
            ]}
            onPress={() => setReferralStatus('given_card')}
          >
            <Text style={[
              styles.buttonText,
              referralStatus === 'given_card' && styles.selectedButtonText
            ]}>Given Card</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Details */}
        <Text style={styles.label}>Contact Name:</Text>
        <View style={styles.inputWithButton}>
          <TextInput
            value={referralContactName}
            onChangeText={setReferralContactName}
            placeholder="Enter contact name"
            style={styles.inputWithButtonField}
          />
          <TouchableOpacity style={styles.contactButton} onPress={pickContact}>
            <Ionicons name="person" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Contact Phone:</Text>
        <TextInput
          value={referralContactNo}
          onChangeText={setReferralContactNo}
          placeholder="Enter contact phone number"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <Text style={styles.label}>Contact Email:</Text>
        <TextInput
          value={referralContactEmail}
          onChangeText={setReferralContactEmail}
          placeholder="Enter contact email"
          keyboardType="email-address"
          style={styles.input}
        />

        {/*<Text style={styles.label}>Your Mobile:</Text>*/}
        {/*<TextInput*/}
        {/*  value={mobile}*/}
        {/*  onChangeText={setMobile}*/}
        {/*  placeholder="Enter your mobile number"*/}
        {/*  keyboardType="phone-pad"*/}
        {/*  style={styles.input}*/}
        {/*/>*/}

        <Text style={styles.label}>Address:</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Enter address"
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        <Text style={styles.label}>Comments:</Text>
        <TextInput
          value={comments}
          onChangeText={setComments}
          placeholder="Enter comments"
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
        />

        {/* Hot Level */}
        <Text style={styles.label}>How Hot Is the Referral:</Text>
        <View style={styles.hotLevelContainer}>
          {[1, 2, 3, 4, 5].map((level) => (
            <HotLevelButton
              key={level}
              level={level}
              selected={referralHotness === level}
              onPress={() => setReferralHotness(level)}
            />
          ))}
        </View>

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

      {/* Contacts Picker Modal */}
      <Modal
        visible={showContactPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contact</Text>
              <TouchableOpacity
                onPress={() => setShowContactPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#042117" />
              </TouchableOpacity>
            </View>
            
            {isLoadingContacts ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#042117" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {deviceContacts.map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => selectContact(contact)}
                    style={styles.modalOption}
                  >
                    <View style={styles.contactItem}>
                      <View style={styles.contactAvatar}>
                        <Ionicons name="person" size={20} color="#fff" />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{contact.name || 'No name'}</Text>
                        {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                          <Text style={styles.contactDetail}>{contact.phoneNumbers[0].number}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  hotLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
  },
  hotLevelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotLevelSelected: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: 'white',
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
    // maxHeight: 300,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputWithButtonField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  contactButton: {
    backgroundColor: '#042117',
    padding: 14,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
  },
  closeButton: {
    padding: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#042117',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#042117',
  },
  contactDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});

export default Referral; 