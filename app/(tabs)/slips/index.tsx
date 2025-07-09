import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Modal, Image, Alert } from "react-native";
// import { styled } from "nativewind/styled";
import FAB from "@/app/components/Fab";
import { router } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { getRequests, deleteRequest } from "@/utils/api";
import { format } from 'date-fns';
import { icons } from "@/assets/constants/icons";

interface RequestData {
  id: number;
  type: string;
  direction: 'sent' | 'received';
  from: string;
  to: string;
  status: string;
  created_at: string;
  updated_at: string;
  data: any;
  from_user: {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
  };
  to_user: {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
  };
}

interface RequestsResponse {
  total: number;
  requests: RequestData[];
}

function formatRequestName(request: RequestData): string {
  const sender = request.from_user?.name || request.from;
  const receiver = request.to_user?.name || request.to;

  switch (request.type) {
    case 'referral':
      return `${sender} sent referral to ${receiver}`;
    case 'thank_you':
      return `${sender} thanked ${receiver} - ₹${request.data.amount}`;
    case 'one_to_one':
      return `${sender} met ${receiver} on ${format(new Date(request.data.meeting_date), 'MMMM dd yyyy')}`;
    default:
      return `${sender} sent to ${receiver}`;
  }
}


function RequestItem({ item }: { item: RequestData }) {
  const getIcon = () => {
    switch (item.type) {
      case 'referral':
        return icons.referral;
      case 'thank_you':
        return icons.tyfcb;
      case 'one_to_one':
        return icons.oneToOne;
      default:
        return icons.ceu;
    }
  };

  const handlePress = () => {
    // Navigate directly to the detail screen with the full request data
    router.push({
      pathname: '/(tabs)/slips/[id]',
      params: {
        id: item.id,
        requestData: JSON.stringify(item)
      }
    });
  };
  const getDisplayUser = () => {
    return item.direction === 'sent'
      ? item.to_user?.name || item.to
      : item.from_user?.name || item.from;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#042117',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        <Image source={getIcon()} style={{ width: 24, height: 24, tintColor: '#fff', objectFit: 'contain' }} />
      </View>
      <View style={{ flex: 1 }}>
        {/* Date */}
        <Text style={{ fontSize: 12, color: '#888' }}>
          {format(new Date(item.created_at), 'MMMM dd yyyy')}
        </Text>
        {/* Dynamic content based on type */}
        {item.type === 'referral' && (
          <>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#042117' }}>
              {getDisplayUser()}
            </Text>
            <Text style={{ color: '#444', fontSize: 14 }}>
              {item.data?.referral_contact_name || 'No contact name'}
            </Text>
          </>
        )}

        {item.type === 'thank_you' && (
          <Text style={{ fontSize: 16 }}>
            <Text style={{ fontWeight: 'bold', color: '#042117' }}>
              {getDisplayUser()}
            </Text>
            <Text style={{ color: '#444' }}> - ₹{item.data?.amount}</Text>
          </Text>
        )}

        {item.type === 'one_to_one' && (
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#042117' }}>
            {getDisplayUser()}
          </Text>
        )}

      </View>
      <Text style={{ color: '#042117', fontSize: 24, fontWeight: 'bold' }}>{'>'}</Text>
    </TouchableOpacity>
  );

}

// const StyledTouchable = styled(TouchableOpacity);

export default function SlipsScreen() {
  const [activeTab, setActiveTab] = useState<'given' | 'received'>('given');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestsData, setRequestsData] = useState<RequestsResponse | null>(null);

  const fetchRequests = async () => {
    try {
      const result = await getRequests();
      if (result.success && result.data) {
        setRequestsData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests();
  }, []);

  const keyExtractor = (item: RequestData) => `${item.type}-${item.id}`;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#042117" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 24 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        {/* <Text className="text-2xl font-black text-primary">ACTIVITY FEED</Text> */}
      </View>
      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0' }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: activeTab === 'given' ? '#042117' : '#fff', padding: 12, alignItems: 'center' }}
          onPress={() => setActiveTab('given')}
        >
          <Text style={{ color: activeTab === 'given' ? '#fff' : '#042117', fontWeight: 'bold' }}>GIVEN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: activeTab === 'received' ? '#042117' : '#fff', padding: 12, alignItems: 'center' }}
          onPress={() => setActiveTab('received')}
        >
          <Text style={{ color: activeTab === 'received' ? '#fff' : '#042117', fontWeight: 'bold' }}>RECEIVED</Text>
        </TouchableOpacity>
      </View>
      {/* Content */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={activeTab === 'given'
            ? (requestsData?.requests || []).filter(req => req.direction === 'sent')
            : (requestsData?.requests || []).filter(req => req.direction === 'received')
          }
          renderItem={({ item }) => (
            <RequestItem item={item} />
          )}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#042117"
            />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ color: '#042117', fontSize: 16 }}>
                {loading
                  ? 'Loading requests...'
                  : error
                    ? `Error: ${error}`
                    : `No ${activeTab} requests found`}
              </Text>
            </View>
          }
        />
      </View>

      <FAB
        onTYFCBPress={() => router.push('/forms/tyfcb')}
        onOneToOnePress={() => router.push('/forms/one-to-one')}
        onReferralPress={() => router.push('/forms/referral')}
        onCEUPress={() => console.log('CEU pressed')}
      />
    </View>
  );
} 