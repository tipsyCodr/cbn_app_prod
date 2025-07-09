import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { getUpcomingMeetings, Meeting } from '@/utils/api';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

export default function MeetingsScreen() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await getUpcomingMeetings();
      if (response.success && response.data) {
        setMeetings(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch upcoming meetings');
        setMeetings([]);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('An error occurred while fetching meetings');
      setMeetings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMeetings();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeetings();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Format as HH:MM
  };

  const renderMeetingItem = ({ item }: { item: Meeting }) => (
    <View style={styles.meetingCard}>
      <View style={styles.meetingHeader}>
        <Text style={styles.meetingName}>{item.name}</Text>
        <Text style={styles.meetingDate}>{formatDate(item.date)}</Text>
        {(item.start_time || item.end_time) && (
          <Text style={styles.meetingTime}>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Text>
        )}
      </View>
      
      <View style={styles.meetingDetails}>
        {item.tyfcb && (
          <View style={styles.detailRow}>
            {/*<Text style={styles.detailLabel}>TYFCB:</Text>*/}
            {/*<Text style={styles.detailValue}>{item.tyfcb}</Text>*/}
          </View>
        )}
        
        {item.visitors && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Visitors:</Text>
            <Text style={styles.detailValue}>{item.visitors}</Text>
          </View>
        )}
        
        {item.speakers && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Speakers:</Text>
            <Text style={styles.detailValue}>{item.speakers}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    
    <>
      <Stack.Screen options={{ headerShown:true,headerTitle: 'Upcoming Meetings' }} />
      
      <SafeAreaView style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#042117" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={meetings}
            renderItem={renderMeetingItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#042117"]}
                tintColor="#042117"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No upcoming meetings found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  meetingHeader: {
    marginBottom: 12,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
    marginBottom: 4,
  },
  meetingDate: {
    fontSize: 16,
    color: '#555',
    marginBottom: 2,
  },
  meetingTime: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  meetingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#042117',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 