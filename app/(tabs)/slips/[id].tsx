import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getRequest, deleteRequest, getRequests } from '@/utils/api';
import { getProfile } from '@/utils/form-api';
import { format } from 'date-fns';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

// Core interfaces
interface RequestData {
  id: number;
  type: string;
  direction: 'sent' | 'received';
  from: string;
  to: string;
  status: string;
  created_at: string;
  data: any;
  from_user?: {
    id: number;
    name: string;
    profile_photo: string | null;
  };
  to_user?: {
    id: number;
    name: string;
    profile_photo: string | null;
  };
}

export default function SlipDetailScreen() {
  const { fromNotification } = useLocalSearchParams();
  const isStandalone = fromNotification === 'true';
  const { id, type: initialType, requestData } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [request, setRequest] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [id, requestData]);

  const loadInitialData = async () => {
    try {
      // Get current user ID
      const userData = await SecureStore.getItemAsync('userData');
      if (userData) {
        const userInfo = JSON.parse(userData);
        if (userInfo?.id) {
          setCurrentUserId(userInfo.id.toString());
        }
      }

      // Try to use passed request data first
      if (requestData) {
        try {
          const parsedData = JSON.parse(requestData);
          setRequest(parsedData);
          setLoading(false);
          return;
        } catch (parseError) {
          console.error('Error parsing passed request data:', parseError);
        }
      }

      // Otherwise fetch from API
      await fetchRequestDetails();
    } catch (error) {
      console.log('Error loading initial data:', error);
      setError('Failed to load request data');
      setLoading(false);
    }
  };

  // Replace the fetchRequestDetails function in your SlipDetailScreen with this:
  const fetchRequestDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try the unified endpoint
      const result = await getRequests();

      if (result.success && result.data) {
        // Look for the request in the requests array
        const allRequests = result.data.requests || [];
        const foundRequest = allRequests.find(req => req.id.toString() === id.toString());

        if (foundRequest) {
          setRequest(foundRequest);
          setLoading(false);
          return;
        }

        // If not found in requests array, try other possible arrays
        const otherArrays = [
          result.data.referrals || [],
          result.data.tyfcbs || [],
          result.data.otos || []
        ];

        for (const array of otherArrays) {
          const foundRequest = array.find(req => req.id.toString() === id.toString());
          if (foundRequest) {
            setRequest(foundRequest);
            setLoading(false);
            return;
          }
        }
      }

      // Fallback: try direct endpoint with specified type
      const typeMapping = {
        'thank_you': 'tyfcb',
        'one_to_one': 'one-to-one',
        'referral': 'referral'
      };

      const types = initialType && typeMapping[initialType] ?
        [typeMapping[initialType]] :
        ['referral', 'one-to-one', 'tyfcb'];

      for (const type of types) {
        try {
          const result = await getRequest(Number(id), type);
          if (result.success && result.data) {
            // Format the request data to match expected structure
            const requestData = result.data.data || result.data;

            // Map type strings for consistency
            const normalizedType = type === 'tyfcb' ? 'thank_you' :
              type === 'one-to-one' ? 'one_to_one' :
                'referral';

            const isFromCurrentUser = requestData.from?.toString() === currentUserId ||
              requestData.user_id?.toString() === currentUserId;

            const formattedRequest = {
              id: Number(id),
              type: normalizedType,
              direction: isFromCurrentUser ? 'sent' : 'received',
              from: requestData.from || requestData.user_id || '',
              to: requestData.to || requestData.met_with || '',
              status: requestData.status || 'active',
              created_at: requestData.created_at || new Date().toISOString(),
              data: requestData,
              from_user: {
                id: parseInt(requestData.from || requestData.user_id || '0'),
                name: `User ${requestData.from || requestData.user_id || ''}`,
                profile_photo: null
              },
              to_user: {
                id: parseInt(requestData.to || requestData.met_with || '0'),
                name: `User ${requestData.to || requestData.met_with || ''}`,
                profile_photo: null
              }
            };

            // Try to get actual user names
            try {
              const fromResult = await getProfile(formattedRequest.from);
              if (fromResult.success && fromResult.data) {
                formattedRequest.from_user.name = fromResult.data.name;
                formattedRequest.from_user.profile_photo = fromResult.data.profile_photo;
              }
            } catch (error) {
              console.log('Could not fetch from user profile');
            }

            try {
              const toResult = await getProfile(formattedRequest.to);
              if (toResult.success && toResult.data) {
                formattedRequest.to_user.name = toResult.data.name;
                formattedRequest.to_user.profile_photo = toResult.data.profile_photo;
              }
            } catch (error) {
              console.log('Could not fetch to user profile');
            }

            setRequest(formattedRequest);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log(`Error fetching request with type ${type}:`, error);
        }
      }

      // If we get here, all attempts failed
      setError("Request not found. It may have been deleted.");
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchRequestDetails:', err);
      setError("Failed to load request details");
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!request) return;

    Alert.alert(
      'Delete Request',
      'Are you sure you want to delete this request? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Map type to endpoint format
              const apiType = request.type === 'thank_you' ? 'tyfcb' :
                request.type === 'one_to_one' ? 'one-to-one' :
                  'referral';

              const result = await deleteRequest(request.id, apiType);
              setLoading(false);

              if (result.success) {
                Alert.alert('Success', 'Request deleted successfully');
                router.back();
              } else {
                Alert.alert('Error', result.message || 'Failed to delete request');
              }
            } catch (err) {
              setLoading(false);
              Alert.alert('Error', 'An unexpected error occurred during deletion');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    if (!request) return;

    // Map request type to form path
    let formPath = '/forms/referral';
    if (request.type === 'thank_you') formPath = '/forms/tyfcb';
    else if (request.type === 'one_to_one') formPath = '/forms/one-to-one';

    router.push({
      pathname: formPath,
      params: { id: request.id }
    });
  };

  const getRequestDetails = () => {
    if (!request) return { title: '', details: [] };

    switch (request.type) {
      case 'referral':
        return {
          title: 'Referral Details',
          details: [
            { label: 'Contact Name', value: request.data.referral_contact_name || 'N/A' },
            { label: 'Contact Number', value: request.data.referral_contact_no || request.data.mobile || 'N/A' },
            { label: 'Contact Email', value: request.data.referral_contact_email || request.data.email || 'N/A' },
            { label: 'Type', value: (request.data.referral_type || 'N/A').toUpperCase() },
            { label: 'Status', value: (request.data.referral_status || 'N/A').replace(/_/g, ' ').toUpperCase() },
            { label: 'Hotness', value: request.data.referral_hotness || 'N/A' },
            { label: 'Address', value: request.data.address || 'N/A' },
            { label: 'Comments', value: request.data.comments || 'N/A' },
          ]
        };
      case 'thank_you':
        return {
          title: 'Thank You For Business',
          details: [
            { label: 'Amount', value: `₹${request.data.amount || '0'}` },
            { label: 'Business Type', value: (request.data.business_type || 'N/A').toUpperCase() },
            { label: 'Referral Type', value: (request.data.referral_type || 'N/A').toUpperCase() },
            { label: 'Comments', value: request.data.comments || 'N/A' },
          ]
        };
      case 'one_to_one':
        return {
          title: 'One-to-One Meeting',
          details: [
            { label: 'Met With', value: request.data.met_with || 'N/A' },
            {
              label: 'Meeting Date', value: request.data.meeting_date ?
                format(new Date(request.data.meeting_date), 'MMMM dd yyyy') : 'N/A'
            },
            { label: 'Location', value: request.data.meeting_location || 'N/A' },
            { label: 'Initiated By', value: request.data.initiated_by || 'N/A' },
            { label: 'Topics', value: request.data.topics || 'N/A' },
          ]
        };
      default:
        return {
          title: 'Request Details',
          details: Object.entries(request.data || {})
            .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
            .map(([key, value]) => ({
              label: key.replace(/_/g, ' ').toUpperCase(),
              value: value || 'N/A'
            }))
        };
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#042117" />
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error || 'Request not found'}</Text>
      </View>
    );
  }

  const { title, details } = getRequestDetails();
  const otherPartyName = request.direction === 'sent'
    ? (request.to_user?.name || `User ${request.to}`)
    : (request.from_user?.name || `User ${request.from}`);

  // Function to format details into a WhatsApp-friendly message
  const getWhatsAppMessage = (details) => {
    return details.map(detail => `${detail.label}: ${detail.value}`).join('\n');
  };

  // Function to trigger WhatsApp
  const sendToWhatsApp = (details) => {
    const message = encodeURIComponent(getWhatsAppMessage(details));
    const phone = ''; // Add a number here like '91xxxxxxxxxx' if needed
    // const phone = request.referral_contact_no; // Add a number here like '91xxxxxxxxxx' if needed
    // const url = `https://wa.me/${phone}?text=${message}`;
    const url = `whatsapp://send?text=${message}`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  return (
    <View style={styles.container}>
      {/* {!isStandalone && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#042117" />
          </TouchableOpacity>
        </View>
      )} */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Type and Direction Header */}
        <View style={styles.typeContainer}>
          <View style={[styles.typeIndicator, getTypeStyle(request.type)]}>
            <Ionicons name={getTypeIcon(request.type)} size={24} color="white" />
          </View>
          <View style={styles.directionContainer}>
            <Text style={styles.directionLabel}>
              {request.direction === 'sent' ? 'Given to' : 'Received from'}
            </Text>
            <Text style={styles.userName}>{otherPartyName}</Text>
          </View>
        </View>

        {/* Direction Banner */}
        <View style={[styles.card, styles.directionBanner]}>
          <Text style={styles.directionText}>
            {getDirectionText(request)}
          </Text>
        </View>

        {/* Date Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color="#042117" />
            <Text style={styles.cardTitle}>Date</Text>
          </View>
          <Text style={styles.cardValue}>
            {format(new Date(request.created_at), 'MMMM dd, yyyy')}
          </Text>
        </View>

        {/* Details Card */}
        {/* JSX*/}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={20} color="#042117" />
            <Text style={styles.cardTitle}>Details</Text>
          </View>

          {details.map((detail, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detail.label}</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}

          {/* Send to WhatsApp Button */}
          {request.type === 'referral' && (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => sendToWhatsApp(details)}
            >
              <View className="flex-1 flex-row justify-center" >
                <Ionicons name="logo-whatsapp" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.whatsappButtonText}>Send to WhatsApp</Text>
              </View>

            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons - Only show if the request was sent by the current user */}
        {'received' !== request.direction && new Date(request.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={handleEdit}
              style={[styles.actionButton, styles.editButton]}
            >
              <Ionicons name="create-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Ionicons name="trash-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Helper functions
function getTypeIcon(type) {
  switch (type) {
    case 'referral': return 'people';
    case 'thank_you': return 'cash';
    case 'one_to_one': return 'cafe';
    default: return 'document-text';
  }
}

function getTypeStyle(type) {
  switch (type) {
    case 'referral': return { backgroundColor: '#4CAF50' };
    case 'thank_you': return { backgroundColor: '#FF9800' };
    case 'one_to_one': return { backgroundColor: '#2196F3' };
    default: return { backgroundColor: '#9E9E9E' };
  }
}

function getDirectionText(request) {
  const otherPartyName = request.direction === 'sent'
    ? (request.to_user?.name || 'this user')
    : (request.from_user?.name || 'This user');

  switch (request.type) {
    case 'thank_you':
      return request.direction === 'sent'
        ? `You thanked ${otherPartyName} for business`
        : `${otherPartyName} thanked you for business`;
    case 'referral':
      return request.direction === 'sent'
        ? `You sent this referral to ${otherPartyName}`
        : `${otherPartyName} sent you this referral`;
    case 'one_to_one':
      return request.direction === 'sent'
        ? `You had a meeting with ${otherPartyName}`
        : `${otherPartyName} had a meeting with you`;
    default:
      return request.direction === 'sent'
        ? `You sent this to ${otherPartyName}`
        : `${otherPartyName} sent this to you`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: 16,
  },
  errorText: {
    color: '#042117',
    textAlign: 'center',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  directionContainer: {
    flex: 1,
  },
  directionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#042117',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#042117',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 16,
    color: '#444D5D',
  },
  detailRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#444D5D',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButton: {
    backgroundColor: '#444D5D',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#042117',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  directionBanner: {
    backgroundColor: 'lightyellow',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  directionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#042117',
    textAlign: 'center',
  },
  whatsappButton: {
    marginTop: 16,
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },

  whatsappButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});