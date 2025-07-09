import { icons } from "@/assets/constants/icons";
import { Link, useNavigation, router } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProfileMiniCard from "../components/home/ProfileMiniCard";
import WeekCard from "../components/home/WeekCard";
import NextMeetingCard from "../components/home/NextMeetingCard";
import ReportCard from "../components/home/ReportCard";
import { getHome, getNotifications, getUnreadNotificationsCount } from "@/utils/api";

// Define types for our data
interface User {
  name?: string;
  company?: string;
  due_date?: string;
  post?: string;
  profile_photo?: string;
}

interface HomeData {
  user?: User;
  next_meeting?: any;
  weekly_slips?: any;
  reports?: any;
}


export default function Index() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchHomeData = async () => {
    console.log('Fetching home data...');
    try {
      const result = await getHome();
      
      if (result.success && result.data) {
        console.log('Home data loaded successfully');
        console.log(result.data);
        setHomeData(result.data as HomeData);
      } else {
        console.error('API Error:', result.message);
        setError(result.message || 'Failed to fetch home data');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const result = await getUnreadNotificationsCount();
      if (result.success && result.data) {
        // Set unread count from the API response
        setUnreadCount(result.data.count);
      }
    } catch (err) {
      console.error('Error fetching notification count:', err);
    }
  };

  // Fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
      fetchNotificationCount();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeData();
    fetchNotificationCount();
  }, []);

  const navigateToNotifications = () => {
    router.push('/notifications');
  };

  return (
    <SafeAreaView style={styles.container}>
      

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#042117"]}
            tintColor="#042117"
          />
        }
      >
        <View className="card-container">
          <View className="p-4 m-4 mb-10">
            {loading && !refreshing ? (
              <ActivityIndicator size="large" color="#042117" />
            ) : error ? (
              <View className="p-4 bg-red-100 rounded-lg">
                <Text className="text-red-600">{error}</Text>
              </View>
            ) : homeData ? (
              <>
                <ProfileMiniCard 
                  name={homeData.user?.name || "John Doe"} 
                  company={homeData.user?.company || "Active"}
                  dueDate={homeData.user?.due_date || "2026-01-01"} 
                  post={homeData.user?.post || "CBN AVIATORS"} 
                  profile_photo={homeData.user?.profile_photo || ""}
                />
                <NextMeetingCard />
                <WeekCard title="This Week Slips" slips={homeData.weekly_slips} />
                <ReportCard title="Reports" reports={homeData.reports} />
              </>
            ) : (
              <View className="p-4 bg-red-100 rounded-lg">
                <Text className="text-red-600">No data available</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerLeft: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#042117',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
